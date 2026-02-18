
use axum::{Router, routing::post, extract::{State, Multipart}, Json};
use serde::{Deserialize, Serialize};
use crate::app_state::AppState;
use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::services::gemini::{GeminiService, GeminiMessage, GeminiPart};
use crate::services::rag::RagService;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/chat", post(chat))
        .route("/vision", post(vision))
        .route("/generate-description", post(generate_description))
        .route("/ingest", post(ingest_knowledge)) // Admin only endpoint to add knowledge
}

#[derive(Deserialize)]
struct ChatRequest {
    messages: Vec<GeminiMessage>,
}

#[derive(Serialize)]
struct ChatResponse {
    text: String,
}

#[derive(Deserialize)]
struct GenDescRequest {
    product_name: String,
    keywords: String,
}

#[derive(Deserialize)]
struct IngestRequest {
    content: String,
}

// --- RAG CHAT ENDPOINT ---
async fn chat(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, AppError> {
    
    check_rate_limit(&state, &user.user_id).await?;

    // 1. Extract latest user query
    let last_user_msg = payload.messages.last()
        .and_then(|m| m.parts.first())
        .and_then(|p| p.text.as_ref())
        .ok_or(AppError::BadRequest("Empty message".into()))?;

    // 2. Retrieve Context via RAG
    let context = RagService::search(&state, last_user_msg)
        .await
        .map_err(|e| AppError::Internal)?;

    // 3. Inject Context into System Prompt
    let system_instruction = format!(
        "Ты — Flora, умный ИИ-флорист. \
        Используй следующую информацию из базы знаний для ответа, если она релевантна:\n\
        ---\n{}\n---\n\
        Если информации недостаточно, отвечай вежливо, опираясь на общие знания о цветах.", 
        context
    );

    // Prepend system instruction
    let mut final_messages = payload.messages;
    final_messages.insert(0, GeminiMessage {
        role: "user".to_string(), // Gemini API treats system instructions as User or Model prompts often in simple setup
        parts: vec![GeminiPart { text: Some(system_instruction) }]
    });

    // 4. Call Gemini
    let response_text = GeminiService::generate_content(&state.config.gemini_api_key, final_messages).await?;

    let _ = sqlx::query!(
        "INSERT INTO usage_logs (user_id, endpoint, model) VALUES ($1, 'chat', 'gemini-3-flash')",
        user.user_id
    )
    .execute(&state.db).await;

    Ok(Json(ChatResponse { text: response_text }))
}

// --- KNOWLEDGE INGESTION (Admin) ---
async fn ingest_knowledge(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<IngestRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if user.role != "admin" {
        return Err(AppError::Unauthorized);
    }

    RagService::ingest(&state, &payload.content)
        .await
        .map_err(|_| AppError::Internal)?;

    Ok(Json(serde_json::json!({ "status": "indexed" })))
}

async fn generate_description(
    State(state): State<AppState>,
    user: AuthUser,
    Json(payload): Json<GenDescRequest>,
) -> Result<Json<ChatResponse>, AppError> {

    check_rate_limit(&state, &user.user_id).await?;

    let prompt = format!(
        "Ты — эксперт по продажам на цветочном маркетплейсе. \
        Напиши продающее, вдохновляющее описание для товара.\n\
        Название: {}\n\
        Ключевые особенности: {}\n\
        Требования:\n\
        - Текст должен быть эмоциональным.\n\
        - Объем: 2-3 предложения.\n\
        - Язык: Русский.", 
        payload.product_name, payload.keywords
    );

    let messages = vec![GeminiMessage {
        role: "user".to_string(),
        parts: vec![GeminiPart { text: Some(prompt) }],
    }];

    let response_text = GeminiService::generate_content(&state.config.gemini_api_key, messages).await?;

    Ok(Json(ChatResponse { text: response_text }))
}

async fn vision(
    State(state): State<AppState>,
    user: AuthUser,
    mut multipart: Multipart,
) -> Result<Json<ChatResponse>, AppError> {

    check_rate_limit(&state, &user.user_id).await?;

    let mut image_data = None;
    let mut mime_type = None;
    let mut prompt = "Describe this flower".to_string();

    while let Some(field) = multipart.next_field().await.map_err(|_| AppError::BadRequest("Multipart error".into()))? {
        let name = field.name().unwrap_or("").to_string();
        
        if name == "image" {
            mime_type = Some(field.content_type().unwrap_or("image/jpeg").to_string());
            let data = field.bytes().await.map_err(|_| AppError::BadRequest("Image read error".into()))?;
            image_data = Some(data);
        } else if name == "prompt" {
            prompt = field.text().await.map_err(|_| AppError::BadRequest("Prompt read error".into()))?;
        }
    }

    if let (Some(data), Some(mime)) = (image_data, mime_type) {
        let response_text = GeminiService::vision_generate(
            &state.config.gemini_api_key, 
            &prompt, 
            &data, 
            &mime
        ).await?;

        Ok(Json(ChatResponse { text: response_text }))
    } else {
        Err(AppError::BadRequest("No image uploaded".into()))
    }
}

async fn check_rate_limit(state: &AppState, user_id: &uuid::Uuid) -> Result<(), AppError> {
    let limit_key = format!("rate_limit:{}", user_id);
    let count: i32 = redis::cmd("INCR").arg(&limit_key).query(&mut state.redis.get_connection()?)?;
    if count == 1 {
        let _ : () = redis::cmd("EXPIRE").arg(&limit_key).arg(86400).query(&mut state.redis.get_connection()?)?;
    }
    if count > 50 { 
        return Err(AppError::BadRequest("Daily AI limit exceeded".to_string()));
    }
    Ok(())
}
