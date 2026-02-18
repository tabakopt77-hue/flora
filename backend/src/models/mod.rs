
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::types::Decimal;
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Product {
    pub id: Uuid,
    pub store_id: Uuid,
    pub name: String,
    pub description: String,
    pub price: Decimal,
    pub stock: i32,
    pub category: String,
    pub image_url: String,
    pub is_active: bool,
    pub tags: Option<Vec<String>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Order {
    pub id: Uuid,
    pub user_id: Uuid,
    pub total: Decimal,
    pub status: String,
    pub delivery_address: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateProductRequest {
    pub name: String,
    pub description: String,
    pub price: Decimal,
    pub stock: i32,
    pub category: String,
    pub image_url: String,
    pub tags: Vec<String>,
}

#[derive(Deserialize, Debug)]
pub struct CreateOrderRequest {
    pub items: Vec<OrderItemDto>,
    pub delivery_address: String,
}

#[derive(Deserialize, Debug)]
pub struct OrderItemDto {
    pub product_id: Uuid,
    pub quantity: i32,
}
