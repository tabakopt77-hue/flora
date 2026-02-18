
use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Redis error: {0}")]
    Redis(#[from] redis::RedisError),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("User already exists")]
    UserExists,
    #[error("AI Service Error: {0}")]
    AIError(String),
    #[error("Bad Request: {0}")]
    BadRequest(String),
    #[error("Internal Server Error")]
    Internal,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::Database(e) => {
                tracing::error!("Database Error: {:?}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Database Error".to_string())
            },
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            AppError::InvalidCredentials => (StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()),
            AppError::UserExists => (StatusCode::CONFLICT, "User already exists".to_string()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::AIError(msg) => (StatusCode::BAD_GATEWAY, format!("AI Service Error: {}", msg)),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".to_string()),
        };

        let body = Json(json!({ "error": message }));
        (status, body).into_response()
    }
}
