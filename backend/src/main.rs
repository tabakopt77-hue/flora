
mod config;
mod errors;
mod middleware;
mod models;
mod routes;
mod services;
mod app_state;

use axum::{Router, routing::{get, post}};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use qdrant_client::prelude::*;
use crate::app_state::AppState;
use crate::config::Config;

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    // Logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "bloom_backend=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();

    // Database
    let pool = PgPoolOptions::new()
        .max_connections(50)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to Database");

    // Redis
    let redis_client = redis::Client::open(config.redis_url.as_str())
        .expect("Failed to create Redis client");

    // Qdrant (Vector DB)
    let qdrant_client = QdrantClient::from_url(&config.qdrant_url)
        .build()
        .expect("Failed to create Qdrant client");

    let state = AppState {
        db: pool,
        redis: redis_client,
        qdrant: qdrant_client,
        config: config.clone(),
    };

    // Ensure Qdrant Collection Exists (for RAG)
    services::rag::ensure_collection(&state).await;

    // Run Migrations
    sqlx::migrate!("./migrations")
        .run(&state.db)
        .await
        .expect("Failed to run migrations");

    // Routes
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        // Webhooks
        .route("/api/telegram/webhook", post(routes::telegram::webhook))
        // API v1
        .nest("/api/v1/auth", routes::auth::routes())
        .nest("/api/v1/ai", routes::ai::routes())
        .nest("/api/v1/products", routes::products::routes())
        .nest("/api/v1/orders", routes::orders::routes())
        .nest("/api/v1/payments", routes::payments::routes())
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("🚀 Server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
