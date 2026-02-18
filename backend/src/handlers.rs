
use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::{PgPool, Postgres, Transaction};
use crate::models::{CreateOrderRequest, PaymentRequest, Order};
use uuid::Uuid;

// --- HEALTH CHECK ---
pub async fn health_check() -> (StatusCode, &'static str) {
    (StatusCode::OK, "Rust Core: Operational")
}

// --- ORDER CREATION (ACID Transaction) ---
// This function ensures that we never create an order if stock is missing.
pub async fn create_order(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<Order>, StatusCode> {
    
    // 1. Start ACID Transaction
    let mut tx: Transaction<'_, Postgres> = pool.begin().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let order_id = Uuid::new_v4();
    let mut total_amount = rust_decimal::Decimal::new(0, 0);

    // 2. Iterate items and Lock Inventory (SELECT FOR UPDATE)
    for item in payload.items {
        // Query stock with Row Locking to prevent race conditions
        let product = sqlx::query!(
            "SELECT price, stock FROM products WHERE id = $1 FOR UPDATE", 
            item.product_id
        )
        .fetch_optional(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        match product {
            Some(p) => {
                if p.stock < item.quantity {
                    // Rollback immediately if stock insufficient
                    return Err(StatusCode::CONFLICT); // 409 Conflict
                }
                
                // Deduct Stock
                sqlx::query!(
                    "UPDATE products SET stock = stock - $1 WHERE id = $2",
                    item.quantity,
                    item.product_id
                )
                .execute(&mut *tx)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                // Accumulate total (using DB price, never trust frontend price)
                total_amount += p.price * rust_decimal::Decimal::from(item.quantity);
            },
            None => return Err(StatusCode::NOT_FOUND),
        }
    }

    // 3. Create Order Record
    let order = sqlx::query_as!(
        Order,
        "INSERT INTO orders (id, user_id, total, status) VALUES ($1, $2, $3, 'CREATED') RETURNING id, user_id, total, status, created_at",
        order_id,
        payload.user_id,
        total_amount
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 4. Commit Transaction
    tx.commit().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::info!("Order {} created successfully. Total: {}", order_id, total_amount);

    Ok(Json(order))
}

// --- PAYMENT PROCESSING (Idempotency) ---
pub async fn process_payment(
    State(pool): State<PgPool>,
    Json(payload): Json<PaymentRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    
    // 1. Check Idempotency Key
    // If key exists, return previous result without processing again.
    let existing_key = sqlx::query!(
        "SELECT response FROM idempotency_keys WHERE key = $1",
        payload.idempotency_key
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if let Some(record) = existing_key {
        tracing::warn!("Idempotent replay for key: {}", payload.idempotency_key);
        // Return stored response (safe retry)
        return Ok(Json(record.response.unwrap_or(serde_json::json!({})))); 
    }

    // 2. Process Logic (Mocking Bank Call)
    // ... logic to call Stripe/Yookassa ...
    let transaction_id = Uuid::new_v4();
    
    // 3. Update Order Status
    sqlx::query!(
        "UPDATE orders SET status = 'PAID', payment_id = $1 WHERE id = $2",
        transaction_id,
        payload.order_id
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 4. Save Idempotency Key
    let response = serde_json::json!({ "success": true, "transaction_id": transaction_id });
    
    sqlx::query!(
        "INSERT INTO idempotency_keys (key, response) VALUES ($1, $2)",
        payload.idempotency_key,
        response
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(response))
}
