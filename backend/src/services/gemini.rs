
use serde::{Deserialize, Serialize};
use crate::errors::AppError;
use base64::{Engine as _, engine::general_purpose};

#[derive(Serialize, Deserialize, Debug)]
pub struct GeminiMessage {
    pub role: String,
    pub parts: Vec<GeminiPart>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GeminiPart {
    pub text: Option<String>,
}

pub struct GeminiService;

impl GeminiService {
    pub async fn generate_content(api_key: &str, messages: Vec<GeminiMessage>) -> Result<String, AppError> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={}", 
            api_key
        );

        let body = serde_json::json!({
            "contents": messages.iter().map(|m| {
                serde_json::json!({
                    "role": if m.role == "user" { "user" } else { "model" },
                    "parts": [{"text": m.parts[0].text}]
                })
            }).collect::<Vec<_>>()
        });

        let client = reqwest::Client::new();
        let res = client.post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::AIError(e.to_string()))?;

        if !res.status().is_success() {
            let error_text = res.text().await.unwrap_or_default();
            tracing::error!("Gemini API Error: {}", error_text);
            return Err(AppError::AIError("Provider rejected request".into()));
        }

        let data: serde_json::Value = res.json().await.map_err(|e| AppError::AIError(e.to_string()))?;
        
        let text = data["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(text)
    }

    pub async fn vision_generate(api_key: &str, prompt: &str, image_bytes: &[u8], mime_type: &str) -> Result<String, AppError> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={}", 
            api_key
        );

        let base64_image = general_purpose::STANDARD.encode(image_bytes);

        let body = serde_json::json!({
            "contents": [{
                "parts": [
                    { "text": prompt },
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64_image
                        }
                    }
                ]
            }]
        });

        let client = reqwest::Client::new();
        let res = client.post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::AIError(e.to_string()))?;

        let data: serde_json::Value = res.json().await.map_err(|e| AppError::AIError(e.to_string()))?;
        
        let text = data["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(text)
    }

    // --- NEW: Embedding Generation ---
    pub async fn embed_text(api_key: &str, text: &str) -> Result<Vec<f32>, AppError> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={}", 
            api_key
        );

        let body = serde_json::json!({
            "model": "models/embedding-001",
            "content": {
                "parts": [{ "text": text }]
            }
        });

        let client = reqwest::Client::new();
        let res = client.post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::AIError(e.to_string()))?;

        if !res.status().is_success() {
             return Err(AppError::AIError("Failed to generate embeddings".into()));
        }

        let data: serde_json::Value = res.json().await.map_err(|e| AppError::AIError(e.to_string()))?;
        
        let embedding_values: Vec<f32> = serde_json::from_value(
            data["embedding"]["values"].clone()
        ).unwrap_or_default();

        Ok(embedding_values)
    }
}
