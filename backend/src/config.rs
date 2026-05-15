
#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub qdrant_url: String,
    pub jwt_secret: String,
    pub gemini_api_key: String,
    pub telegram_bot_token: String,
    // Payment & Delivery
    pub sberbank_user: String,
    pub sberbank_password: String,
    pub sberbank_api_url: String,
    pub saferoute_token: String,
    pub saferoute_shop_id: String,
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
            
            sberbank_user: std::env::var("SBERBANK_USER_NAME").unwrap_or_default(),
            sberbank_password: std::env::var("SBERBANK_PASSWORD").unwrap_or_default(),
            sberbank_api_url: std::env::var("SBERBANK_API_URL").unwrap_or("https://3dsec.sberbank.ru/payment/rest".to_string()),
            
            saferoute_token: std::env::var("SAFEROUTE_API_TOKEN").unwrap_or_default(),
            saferoute_shop_id: std::env::var("SAFEROUTE_SHOP_ID").unwrap_or_default(),
        }
    }
}
