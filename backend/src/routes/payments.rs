
use axum::{Router, routing::post, extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use rust_decimal::Decimal;
use crate::app_state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/charge", post(charge))
}

#[derive(Deserialize)]
struct ChargeRequest {
    order_id: Uuid,
    amount: Decimal,
    method: String,
    idempotency_key: String,
}

#[derive(Serialize)]
struct ChargeResponse {
    success: bool,
    transaction_id: String,
    status: String,
}

async fn charge(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<ChargeRequest>,
) -> Result<Json<ChargeResponse>, AppError> {
    
    // 1. Idempotency Check (Prevent Double Charge)
    let existing_key = sqlx::query!(
        "SELECT response FROM idempotency_keys WHERE key = $1",
        payload.idempotency_key
    )
    .fetch_optional(&state.db)
    .await?;

    if let Some(record) = existing_key {
        if let Some(json_resp) = record.response {
            let resp: ChargeResponse = serde_json::from_value(json_resp).unwrap_or(ChargeResponse {
                success: true,
                transaction_id: "replay".to_string(),
                status: "idempotent_replay".to_string()
            });
            return Ok(Json(resp));
        }
    }

    // 2. Verify Order Exists and belongs to User
    let order = sqlx::query!(
        "SELECT id, total, status FROM orders WHERE id = $1 AND user_id = $2",
        payload.order_id,
        user.user_id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::BadRequest("Order not found".into()))?;

    if order.status == "paid" {
         return Err(AppError::BadRequest("Order already paid".into()));
    }

    if order.total != payload.amount {
         // Security check: ensure frontend didn't spoof the amount
         return Err(AppError::BadRequest("Amount mismatch".into()));
    }

    // 3. Simulate Bank Transaction (Delay)
    // In production, call Stripe/YooKassa API here
    tokio::time::sleep(std::time::Duration::from_millis(800)).await;
    
    let transaction_id = format!("tx_{}", Uuid::new_v4().simple());

    // 4. Update Order Status
    sqlx::query!(
        "UPDATE orders SET status = 'paid', payment_id = $1, updated_at = NOW() WHERE id = $2",
        transaction_id,
        payload.order_id
    )
    .execute(&state.db)
    .await?;

    // 5. Save Idempotency Record
    let response = ChargeResponse {
        success: true,
        transaction_id: transaction_id.clone(),
        status: "success".to_string(),
    };

    sqlx::query!(
        "INSERT INTO idempotency_keys (key, response) VALUES ($1, $2)",
        payload.idempotency_key,
        serde_json::to_value(&response).unwrap_or_default()
    )
    .execute(&state.db)
    .await?;

    Ok(Json(response))
}
