
-- 🌸 AURA FLORA DATABASE SCHEMA v2.0
-- Supports: Marketplace, RAG AI, Analytics, High-Load Inventory

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For RAG

-- 1. USERS & AUTH (RBAC)
CREATE TYPE user_role AS ENUM ('guest', 'buyer', 'seller', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth users
    full_name VARCHAR(100),
    role user_role DEFAULT 'buyer',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Seller Specific Fields
    shop_name VARCHAR(100),
    shop_description TEXT,
    shop_rating DECIMAL(3, 2) DEFAULT 5.00
);

-- 2. PRODUCTS (Core Data)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL, -- SEO friendly URL
    description TEXT NOT NULL,
    
    base_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL, -- Including discounts
    
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    category VARCHAR(50) NOT NULL, -- 'bouquet', 'potted', 'gift'
    tags TEXT[],
    
    images TEXT[], -- Array of image URLs
    
    -- Analytics & Sorting
    views_count BIGINT DEFAULT 0,
    sales_count BIGINT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI KNOWLEDGE BASE (RAG)
-- This table stores chunks of information: product descriptions, blog posts, care guides
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'blog', 'faq', 'care_guide'
    entity_id UUID, -- Optional link to specific product/post
    
    content_text TEXT NOT NULL, -- The actual text chunk
    embedding vector(1536), -- OpenAI Ada-002 / 3-small compatible dimension
    
    metadata JSONB, -- Flexible metadata for filtering (e.g. { "season": "summer", "color": "red" })
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX ON knowledge_embeddings USING hnsw (embedding vector_cosine_ops);

-- 4. ORDERS (Transactional)
CREATE TYPE order_status AS ENUM ('created', 'paid', 'assembly', 'shipping', 'delivered', 'cancelled', 'dispute');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Nullable for guest checkout
    
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    status order_status DEFAULT 'created',
    
    delivery_address JSONB NOT NULL, -- { "city": "...", "street": "...", "coords": [lat, lon] }
    delivery_window TIMESTAMPTZ,
    
    stripe_payment_id VARCHAR(100),
    idempotency_key UUID UNIQUE NOT NULL, -- Rust ensures this is unique
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    seller_id UUID NOT NULL REFERENCES users(id), -- Denormalized for easy seller payouts
    
    quantity INT NOT NULL,
    price_at_moment DECIMAL(10, 2) NOT NULL,
    
    gift_message TEXT
);

-- 5. USER PREFERENCES (AI Personalization)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    
    -- AI generated preferences
    favorite_colors TEXT[],
    price_segment VARCHAR(20), -- 'budget', 'premium', 'luxury'
    important_dates JSONB, -- [{ "date": "03-08", "relation": "wife", "name": "Maria" }]
    
    last_interaction_embedding vector(1536), -- Vector representation of user's last interests
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHAT HISTORY (For Context & Fine-tuning)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID NOT NULL,
    
    role VARCHAR(10) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    
    related_product_ids UUID[], -- Products recommended in this message
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
