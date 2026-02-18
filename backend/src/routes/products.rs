
use axum::{Router, routing::{get, post, put}, extract::{State, Path}, Json};
use uuid::Uuid;
use crate::app_state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::{Product, CreateProductRequest};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_products).post(create_product))
        .route("/:id", put(update_product).delete(delete_product))
}

async fn list_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<Product>>, AppError> {
    let products = sqlx::query_as!(
        Product,
        "SELECT id, store_id, name, description, price, stock, category, image_url, is_active, tags, created_at 
         FROM products WHERE is_active = true ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(products))
}

async fn create_product(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<CreateProductRequest>,
) -> Result<Json<Product>, AppError> {
    if user.role != "seller" && user.role != "admin" {
        return Err(AppError::Unauthorized);
    }

    let product = sqlx::query_as!(
        Product,
        "INSERT INTO products (store_id, name, description, price, stock, category, image_url, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, store_id, name, description, price, stock, category, image_url, is_active, tags, created_at",
        user.user_id,
        payload.name,
        payload.description,
        payload.price,
        payload.stock,
        payload.category,
        payload.image_url,
        &payload.tags
    )
    .fetch_one(&state.db)
    .await?;

    Ok(Json(product))
}

async fn update_product(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<CreateProductRequest>,
) -> Result<Json<Product>, AppError> {
    // Ensure ownership
    let existing = sqlx::query!("SELECT store_id FROM products WHERE id = $1", id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::BadRequest("Product not found".into()))?;

    if existing.store_id != user.user_id && user.role != "admin" {
         return Err(AppError::Unauthorized);
    }

    let product = sqlx::query_as!(
        Product,
        "UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5, image_url=$6, tags=$7, updated_at=NOW()
         WHERE id = $8
         RETURNING id, store_id, name, description, price, stock, category, image_url, is_active, tags, created_at",
        payload.name,
        payload.description,
        payload.price,
        payload.stock,
        payload.category,
        payload.image_url,
        &payload.tags,
        id
    )
    .fetch_one(&state.db)
    .await?;

    Ok(Json(product))
}

async fn delete_product(
    State(state): State<AppState>,
    user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let existing = sqlx::query!("SELECT store_id FROM products WHERE id = $1", id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::BadRequest("Product not found".into()))?;

    if existing.store_id != user.user_id && user.role != "admin" {
         return Err(AppError::Unauthorized);
    }

    // Soft delete
    sqlx::query!("UPDATE products SET is_active = false WHERE id = $1", id)
        .execute(&state.db)
        .await?;

    Ok(Json(serde_json::json!({ "status": "deleted" })))
}
