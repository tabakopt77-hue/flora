
# 🚀 Final Launch Architecture (Series A-Ready)

## 🎯 Core Strategy
*   **Rust (Axum)** = Mission Critical. Money, Orders, Inventory, ACID Transactions.
*   **Node.js (NestJS)** = Orchestration. API Gateway, Auth, Rate Limiting.
*   **Python (FastAPI)** = Intelligence. AI, RAG, Recommendations (Non-blocking).
*   **Infrastructure**: Kubernetes, Kafka, PostgreSQL, Redis.

## 1. Architecture Map

```mermaid
graph TD
    User[Client (Next.js)] --> Gateway[API Gateway (Node.js)]
    
    subgraph "Orchestration Layer"
        Gateway --> Auth[Auth Service (Node.js)]
    end

    subgraph "Critical Core (Rust)"
        Gateway --> Orders[Order Service]
        Gateway --> Payments[Payment Service]
        Gateway --> Inventory[Inventory Service]
    end

    subgraph "Intelligence (Python)"
        Gateway --> AI[AI Service]
        Gateway --> Vision[Computer Vision]
    end

    subgraph "Data Plane"
        Orders --> Kafka[Kafka Event Bus]
        AI --> Kafka
        
        Kafka --> DB[(PostgreSQL)]
        Kafka --> Redis[(Redis Cache)]
    end
```

## 2. Service Responsibilities

### 🟢 API Gateway (Node.js)
*   **Endpoints**: `/api/v1/*`
*   **Auth**: JWT Validation (Access 15min / Refresh 7d).
*   **Security**: WAF, Rate Limiting per IP.

### 🟠 Rust Core (The Money Maker)
*   **Stack**: Axum + SQLx.
*   **Rules**: 
    *   Strict ACID compliance.
    *   `SELECT FOR UPDATE` on inventory checks.
    *   Idempotency keys for all payment requests.
*   **Performance**: < 50ms p99 latency.

### 🔵 Python AI (The Brain)
*   **Stack**: FastAPI + LangChain.
*   **Tasks**:
    *   Generative descriptions.
    *   Smart recommendations (RAG).
    *   Visual Search.
*   **Constraint**: Never blocks the main thread. Async queues only.

## 3. Data Schema (Critical Tables)

### `orders`
*   `id`: UUID (PK)
*   `user_id`: UUID (Indexed)
*   `status`: Enum (CREATED, PAID, SHIPPED...)
*   `total_amount`: Decimal(10,2)
*   `idempotency_key`: String (Unique)

### `inventory_locks` (Redis)
*   Key: `lock:product:{id}`
*   TTL: 5 minutes
*   Purpose: Prevents overselling during checkout.

## 4. Launch Checklist (MVP)
1.  [x] **Auth**: HttpOnly Cookies + JWT Rotation.
2.  [x] **Transactions**: SQLx transactions for Order+Inventory updates.
3.  [x] **AI**: Timeout set to 15s with fallback to static content.
4.  [x] **Logs**: Structured JSON logs with `trace_id`.
