
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::types::Decimal;
use chrono::{DateTime, Utc};

// --- REQUEST DTOs ---

#[derive(Deserialize, Debug)]
pub struct CreateOrderRequest {
    pub user_id: Uuid,
    pub items: Vec<OrderItemDto>,
    pub delivery_address: String,
}

#[derive(Deserialize, Debug)]
pub struct OrderItemDto {
    pub product_id: Uuid,
    pub quantity: i32,
}

#[derive(Deserialize, Debug)]
pub struct PaymentRequest {
    pub order_id: Uuid,
    pub amount: Decimal,
    pub method: String,
    pub idempotency_key: String, // CRITICAL for Enterprise Payments
}

// --- DOMAIN MODELS ---

#[derive(Serialize, Debug)]
pub struct Order {
    pub id: Uuid,
    pub user_id: Uuid,
    pub total: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
}
