
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
        .route("/sber/register", post(sber_register))
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

// Sberbank specific structs
#[derive(Deserialize)]
struct SberRegisterRequest {
    order_id: Uuid,
    amount: Decimal, // In Rubles
    return_url: String,
}

#[derive(Serialize)]
struct SberRegisterResponse {
    order_id: String, // Sberbank MDOrder
    form_url: String, // Redirect URL
}

async fn sber_register(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<SberRegisterRequest>,
) -> Result<Json<SberRegisterResponse>, AppError> {

    // 1. Verify Order in DB
    let order = sqlx::query!(
        "SELECT id, total FROM orders WHERE id = $1",
        payload.order_id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::BadRequest("Order not found".into()))?;

    // Check amount match (security)
    if order.total != payload.amount {
        return Err(AppError::BadRequest("Amount mismatch".into()));
    }

    // 2. Prepare request to Sberbank
    let amount_cents = (payload.amount * Decimal::from(100)).to_i64().unwrap_or(0);
    let sber_url = format!("{}/register.do", state.config.sberbank_api_url);
    
    // In production, you would make the actual request here:
    /*
    let params = [
        ("userName", &state.config.sberbank_user),
        ("password", &state.config.sberbank_password),
        ("orderNumber", &payload.order_id.to_string()),
        ("amount", &amount_cents.to_string()),
        ("returnUrl", &payload.return_url)
    ];
    let client = reqwest::Client::new();
    let res = client.post(&sber_url).form(&params).send().await...
    */

    // 3. MOCK RESPONSE (For Demo purposes without real Sber credentials)
    // We simulate that Sberbank registered the order and returned a payment page URL
    let mock_form_url = format!("https://3dsec.sberbank.ru/payment/merchants/test/payment_ru.html?mdOrder={}", Uuid::new_v4());
    
    // NOTE: In a real deploy, if credentials aren't set, this mock allows testing the UI flow.
    let response = SberRegisterResponse {
        order_id: Uuid::new_v4().to_string(),
        form_url: mock_form_url, 
    };

    tracing::info!("Registered Sberbank Order for {}. Redirect: {}", payload.order_id, response.form_url);

    Ok(Json(response))
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

    // 2. Verify Order
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

    // 3. Update Order Status
    let transaction_id = format!("tx_{}", Uuid::new_v4().simple());
    
    sqlx::query!(
        "UPDATE orders SET status = 'paid', payment_id = $1, updated_at = NOW() WHERE id = $2",
        transaction_id,
        payload.order_id
    )
    .execute(&state.db)
    .await?;

    // 4. Save Idempotency Record
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
