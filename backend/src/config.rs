
#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub qdrant_url: String,
    pub jwt_secret: String,
    pub gemini_api_key: String,
    pub telegram_bot_token: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            redis_url: std::env::var("REDIS_URL").expect("REDIS_URL must be set"),
            qdrant_url: std::env::var("QDRANT_URL").expect("QDRANT_URL must be set"),
            jwt_secret: std::env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
            gemini_api_key: std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set"),
            telegram_bot_token: std::env::var("TELEGRAM_BOT_TOKEN").unwrap_or_default(),
        }
    }
}
