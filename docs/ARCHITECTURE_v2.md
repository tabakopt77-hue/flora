
# 🏛 Floramos Enterprise Architecture (v2.0)

## 1. High-Level Overview

Система строится по принципу **Composable Commerce** с четким разделением ответственности.

```mermaid
graph TD
    Client[Mobile/Web Client (Next.js)] -->|HTTPS/WSS| Gateway[Node.js API Gateway]
    
    subgraph "Orchestration Layer"
        Gateway --> Auth[Auth Service (JWT/RBAC)]
        Gateway --> Cache[Redis Cache]
    end

    subgraph "Intelligence Layer (Python FastAPI)"
        Gateway --> AICore[AI Orchestrator]
        AICore --> RAG[RAG Engine]
        AICore --> Vision[Computer Vision]
        AICore --> LLM[LLM Interface (OpenAI/Azure)]
        RAG <--> VectorDB[(PostgreSQL + pgvector)]
    end

    subgraph "Performance Core (Rust Axum)"
        Gateway --> Engine[Rust Core Engine]
        Engine --> Pricing[Dynamic Pricing]
        Engine --> Inventory[Inventory Lock]
        Engine --> Ranking[Search Ranking]
    end

    subgraph "Data Persistence"
        Engine --> MainDB[(PostgreSQL Primary)]
        AICore --> MainDB
    end
```

## 2. Service Contracts

### 🌐 Frontend (Next.js 14+)
*   **Role**: SSR Rendering, Client State, SEO, Optimistic UI.
*   **Interaction**: Calls ONLY Node.js Gateway. Never talks to DB or Python directly.

### 🟢 API Gateway (Node.js / NestJS)
*   **Port**: 3000 (Public)
*   **Responsibilities**:
    *   Request Validation (Zod).
    *   Rate Limiting (Redis-backed).
    *   WebSocket Server (для чата с AI в реальном времени).
    *   Aggregation (сбор данных от Rust и Python в один ответ для фронта).

### 🔵 AI Core (Python / FastAPI)
*   **Port**: 8000 (Internal)
*   **Endpoints**:
    *   `POST /v1/chat/completion` - Основной RAG-диалог.
    *   `POST /v1/recommend/personal` - Персонализация выдачи.
    *   `POST /v1/vision/analyze` - Анализ фото букетов.
*   **Stack**: LangChain, OpenAI SDK, pgvector driver.

### 🟠 Performance Engine (Rust / Axum)
*   **Port**: 8080 (Internal)
*   **Responsibilities**:
    *   CRUD товаров (сверхбыстрый).
    *   Транзакции заказов (ACID).
    *   Сложные расчеты корзины (скидки, доставка, налоги).
    *   Фоновая переиндексация поиска.

## 3. Data Flow (Example: "Find a gift for Mom")

1.  **User** sends voice/text to **Next.js**.
2.  **Next.js** forwards to **Gateway**.
3.  **Gateway** checks Auth & Rate Limits.
4.  **Gateway** sends prompt to **Python AI**.
5.  **Python AI**:
    *   Converts text to Vector (Embeddings).
    *   Queries **PostgreSQL (pgvector)** for relevant products.
    *   Queries **Rust Core** for *current* stock and price of found products.
    *   Generates answer via LLM.
6.  **Gateway** returns JSON with text + Product Cards to **Next.js**.
7.  **Next.js** renders chat bubble + interactive Product Carousel.

## 4. Infrastructure Requirements

*   **PostgreSQL 16+**: Must verify `pgvector` extension support.
*   **Redis 7**: Pub/Sub for realtime chat, Key-Value for sessions.
*   **S3 Compatible Storage**: Product images, user uploads.
*   **Docker Compose**: Local development orchestration.
