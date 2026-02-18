
use axum::{Router, routing::{get, post}, extract::State, Json};
use sqlx::{Postgres, Transaction};
use uuid::Uuid;
use crate::app_state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::{Order, CreateOrderRequest};
use crate::services::notification::NotificationService;
use rust_decimal::Decimal;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/create", post(create_order))
        .route("/my", get(list_my_orders))
}

async fn list_my_orders(
    State(state): State<AppState>,
    user: AuthUser,
) -> Result<Json<Vec<Order>>, AppError> {
    let orders = sqlx::query_as!(
        Order,
        "SELECT id, user_id, total, status, delivery_address, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
        user.user_id
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(orders))
}

// ACID Transaction for Order Creation
async fn create_order(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<Order>, AppError> {
    
    // 1. Start Transaction
    let mut tx: Transaction<'_, Postgres> = state.db.begin().await.map_err(AppError::Database)?;

    let order_id = Uuid::new_v4();
    let mut total_amount = Decimal::new(0, 0);
    let mut items_count = 0;

    // 2. Iterate items, Lock Inventory (SELECT FOR UPDATE), Deduct Stock
    for item in payload.items {
        // FOR UPDATE locks the row, preventing race conditions (overselling)
        let product = sqlx::query!(
            "SELECT price, stock FROM products WHERE id = $1 FOR UPDATE", 
            item.product_id
        )
        .fetch_optional(&mut *tx)
        .await
        .map_err(AppError::Database)?;

        match product {
            Some(p) => {
                if p.stock < item.quantity {
                    return Err(AppError::BadRequest(format!("Insufficient stock for product {}", item.product_id)));
                }
                
                // Deduct Stock
                sqlx::query!(
                    "UPDATE products SET stock = stock - $1 WHERE id = $2",
                    item.quantity,
                    item.product_id
                )
                .execute(&mut *tx)
                .await
                .map_err(AppError::Database)?;

                let item_total = p.price * Decimal::from(item.quantity);
                total_amount += item_total;
                items_count += item.quantity as usize;

                // Create Order Item
                sqlx::query!(
                    "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
                    order_id,
                    item.product_id,
                    item.quantity,
                    p.price
                )
                .execute(&mut *tx)
                .await
                .map_err(AppError::Database)?;
            },
            None => return Err(AppError::BadRequest(format!("Product {} not found", item.product_id))),
        }
    }

    // 3. Create Order Header
    let order = sqlx::query_as!(
        Order,
        "INSERT INTO orders (id, user_id, total, status, delivery_address) VALUES ($1, $2, $3, 'pending', $4) 
         RETURNING id, user_id, total, status, delivery_address, created_at",
        order_id,
        user.user_id,
        total_amount,
        payload.delivery_address
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(AppError::Database)?;

    // 4. Commit Transaction
    tx.commit().await.map_err(AppError::Database)?;

    // 5. Async Notification (Fire & Forget)
    let state_clone = state.clone();
    tokio::spawn(async move {
        NotificationService::send_order_alert(&state_clone, order_id, total_amount, items_count).await;
    });

    Ok(Json(order))
}
