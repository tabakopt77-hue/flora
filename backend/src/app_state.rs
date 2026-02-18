
use sqlx::PgPool;
use redis::Client;
use qdrant_client::prelude::*;
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: Client,
    pub qdrant: QdrantClient,
    pub config: Config,
}
