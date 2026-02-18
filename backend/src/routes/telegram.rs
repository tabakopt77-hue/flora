
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use crate::app_state::AppState;
use crate::services::gemini::{GeminiService, GeminiMessage, GeminiPart};
use crate::services::rag::RagService;

// --- Telegram Structs ---
#[derive(Deserialize, Debug)]
pub struct Update {
    message: Option<Message>,
}

#[derive(Deserialize, Debug)]
struct Message {
    chat: Chat,
    text: Option<String>,
}

#[derive(Deserialize, Debug)]
struct Chat {
    id: i64,
}

#[derive(Serialize)]
struct TelegramResponse {
    chat_id: i64,
    text: String,
}

pub async fn webhook(
    State(state): State<AppState>,
    Json(update): Json<Update>,
) -> Json<serde_json::Value> {
    
    // Fire and Forget (spawn async task) to reply quickly to Telegram webhook
    if let Some(msg) = update.message {
        if let Some(text) = msg.text {
            let chat_id = msg.chat.id;
            let state_clone = state.clone();

            tokio::spawn(async move {
                handle_telegram_message(state_clone, chat_id, text).await;
            });
        }
    }

    Json(serde_json::json!({ "status": "ok" }))
}

async fn handle_telegram_message(state: AppState, chat_id: i64, text: String) {
    let api_key = &state.config.gemini_api_key;
    let bot_token = &state.config.telegram_bot_token;

    // 1. RAG Retrieval
    let context = RagService::search(&state, &text).await.unwrap_or_default();

    // 2. AI Generation
    let messages = vec![
        GeminiMessage {
            role: "user".to_string(),
            parts: vec![GeminiPart { 
                text: Some(format!(
                    "Контекст: {}\n\nВопрос пользователя Telegram: {}", 
                    context, text
                )) 
            }],
        }
    ];

    let response = GeminiService::generate_content(api_key, messages)
        .await
        .unwrap_or_else(|_| "Извините, я сейчас занят букетами. Повторите позже.".to_string());

    // 3. Send Reply via Telegram API
    let url = format!("https://api.telegram.org/bot{}/sendMessage", bot_token);
    let payload = TelegramResponse { chat_id, text: response };

    let _ = reqwest::Client::new()
        .post(&url)
        .json(&payload)
        .send()
        .await;
}
