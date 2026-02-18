
use axum::{Router, routing::post, extract::State, Json};
use argon2::{Argon2, PasswordHash, PasswordVerifier, PasswordHasher, password_hash::SaltString};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{Utc, Duration};
use jsonwebtoken::{encode, EncodingKey, Header};
use crate::app_state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::Claims;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

#[derive(Deserialize)]
struct AuthPayload {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    user: UserResponse,
}

#[derive(Serialize)]
struct UserResponse {
    id: Uuid,
    email: String,
    role: String,
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<AuthPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    // 1. Hash Password
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| AppError::Internal)?
        .to_string();

    // 2. Insert User
    let user_id = Uuid::new_v4();
    sqlx::query!(
        "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
        user_id, payload.email, password_hash
    )
    .execute(&state.db)
    .await
    .map_err(|e| match e { 
        sqlx::Error::Database(dbe) if dbe.is_unique_violation() => AppError::UserExists,
        _ => AppError::Database(e)
    })?;

    // 3. Generate Token
    let token = generate_token(user_id, "buyer", &state.config.jwt_secret)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse { id: user_id, email: payload.email, role: "buyer".to_string() }
    }))
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<AuthPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    let user = sqlx::query!(
        "SELECT id, email, password_hash, role FROM users WHERE email = $1",
        payload.email
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::InvalidCredentials)?;

    let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|_| AppError::Internal)?;
    if Argon2::default().verify_password(payload.password.as_bytes(), &parsed_hash).is_err() {
        return Err(AppError::InvalidCredentials);
    }

    let token = generate_token(user.id, &user.role, &state.config.jwt_secret)?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse { id: user.id, email: user.email, role: user.role }
    }))
}

fn generate_token(user_id: Uuid, role: &str, secret: &str) -> Result<String, AppError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(1))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims { sub: user_id, exp: expiration, role: role.to_string() };
    
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
        .map_err(|_| AppError::Internal)
}
