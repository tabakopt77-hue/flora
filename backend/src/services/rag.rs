
use qdrant_client::prelude::*;
use qdrant_client::qdrant::{
    vectors_config::Config as VectorsConfigEnum, CreateCollection, Distance, PointStruct, VectorParams,
    VectorsConfig, SearchPoints,
};
use crate::app_state::AppState;
use crate::services::gemini::GeminiService;
use uuid::Uuid;

const COLLECTION_NAME: &str = "bloom_knowledge";

pub async fn ensure_collection(state: &AppState) {
    let collection_exists = state.qdrant
        .collection_exists(COLLECTION_NAME)
        .await
        .unwrap_or(false);

    if !collection_exists {
        tracing::info!("Creating Qdrant collection: {}", COLLECTION_NAME);
        state.qdrant
            .create_collection(&CreateCollection {
                collection_name: COLLECTION_NAME.to_string(),
                vectors_config: Some(VectorsConfig {
                    config: Some(VectorsConfigEnum::Params(VectorParams {
                        size: 768, // Gemini Embedding size
                        distance: Distance::Cosine.into(),
                        ..Default::default()
                    })),
                }),
                ..Default::default()
            })
            .await
            .expect("Failed to create Qdrant collection");
    }
}

pub struct RagService;

impl RagService {
    // Search Vector DB for relevant context
    pub async fn search(state: &AppState, query: &str) -> Result<String, anyhow::Error> {
        // 1. Vectorize Query
        let embedding = GeminiService::embed_text(&state.config.gemini_api_key, query).await?;

        if embedding.is_empty() {
            return Ok("".to_string());
        }

        // 2. Search Qdrant
        let search_result = state.qdrant
            .search_points(&SearchPoints {
                collection_name: COLLECTION_NAME.to_string(),
                vector: embedding,
                limit: 3,
                with_payload: Some(true.into()),
                ..Default::default()
            })
            .await?;

        // 3. Extract Text
        let context: Vec<String> = search_result.result.into_iter().filter_map(|point| {
            point.payload.get("content").and_then(|v| v.as_str()).map(|s| s.to_string())
        }).collect();

        Ok(context.join("\n---\n"))
    }

    // Add Document to Knowledge Base
    pub async fn ingest(state: &AppState, content: &str) -> Result<(), anyhow::Error> {
        let embedding = GeminiService::embed_text(&state.config.gemini_api_key, content).await?;
        
        let point = PointStruct::new(
            Uuid::new_v4().to_string(),
            embedding,
            serde_json::json!({ "content": content }).try_into().unwrap(),
        );

        state.qdrant
            .upsert_points_blocking(COLLECTION_NAME, None, vec![point], None)
            .await?;

        Ok(())
    }
}
