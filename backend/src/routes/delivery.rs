
use axum::{Router, routing::post, extract::State, Json};
use serde::{Deserialize, Serialize};
use crate::app_state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/calculate", post(calculate_delivery))
}

#[derive(Deserialize)]
struct CalculateRequest {
    city: String,
}

#[derive(Serialize)]
struct DeliveryOption {
    service_name: String,
    price: f64,
    days_min: i32,
    days_max: i32,
    type_code: String, // 'courier' or 'pickup'
}

#[derive(Serialize)]
struct CalculateResponse {
    options: Vec<DeliveryOption>,
}

async fn calculate_delivery(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<CalculateRequest>,
) -> Result<Json<CalculateResponse>, AppError> {
    
    // In a real SafeRoute integration, we would call their API here.
    // Example SafeRoute API call structure (commented out due to missing real credentials):
    /*
    let client = reqwest::Client::new();
    let resp = client.post("https://api.saferoute.ru/v2/calculator")
        .header("Authorization", format!("Bearer {}", state.config.saferoute_token))
        .json(&serde_json::json!({
             "city_name": payload.city,
             "weight": 1.5, // Avg bouquet weight
             "side1": 40, "side2": 30, "side3": 30
        }))
        .send().await...
    */

    // MOCK LOGIC for Demonstration purposes
    // Simulating SafeRoute calculation logic based on city name distance
    let base_price = if payload.city.to_lowercase().contains("москва") || payload.city.to_lowercase().contains("moscow") {
        350.0
    } else if payload.city.to_lowercase().contains("петербург") {
        450.0
    } else {
        750.0
    };

    let options = vec![
        DeliveryOption {
            service_name: "SafeRoute Курьер (Срочная)",
            price: base_price + 200.0,
            days_min: 0,
            days_max: 1,
            type_code: "courier".to_string(),
        },
        DeliveryOption {
            service_name: "SafeRoute Стандарт",
            price: base_price,
            days_min: 1,
            days_max: 3,
            type_code: "courier".to_string(),
        },
        DeliveryOption {
            service_name: "ПВЗ (Самовывоз)",
            price: base_price * 0.6,
            days_min: 2,
            days_max: 4,
            type_code: "pickup".to_string(),
        }
    ];

    Ok(Json(CalculateResponse { options }))
}
