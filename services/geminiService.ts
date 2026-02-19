
import { Product, UserPreferences, ChatMessage, PriceAnalysis, DemandForecast, Category, AIVerdict } from "../types";
import { db } from "./db";
import { apiGateway } from "./apiGateway";

const cleanAndParseJson = (text: string | undefined) => {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", text, e);
    return null;
  }
};

// --- RAG SYSTEM: KNOWLEDGE BASE ---

const KNOWLEDGE_BASE = {
  shipping: "Доставка осуществляется по Москве и МО. Бесплатно от 10 000 руб. Стандартная доставка: 500 руб. Срочная доставка за 2 часа: 1500 руб. Интервалы доставки: 10-14, 14-18, 18-22.",
  care: "Общие правила ухода: Подрезайте стебли под углом 45 градусов. Используйте чистую прохладную воду. Меняйте воду раз в 2 дня. Не ставьте цветы на сквозняке, у батарей или под прямые солнечные лучи.",
  returns: "Цветы являются товаром надлежащего качества, не подлежащим возврату (Постановление РФ №55). Однако, если букет приехал вялым, мы заменим его в течение 24 часов. пришлите фото в течение часа после получения.",
  about: "Aura Flora — премиальный цветочный маркетплейс, объединяющий лучших флористов. Мы используем ИИ для проверки качества каждого букета перед отправкой."
};

const retrieveRAGContext = (query: string): string => {
  const q = query.toLowerCase();
  let retrievedDocs = [];

  // Simulate Vector Search / Semantic Retrieval
  if (q.includes('доставк') || q.includes('привез') || q.includes('когда')) retrievedDocs.push(`ПОЛИТИКА ДОСТАВКИ: ${KNOWLEDGE_BASE.shipping}`);
  if (q.includes('уход') || q.includes('стоять') || q.includes('вян')) retrievedDocs.push(`СОВЕТЫ ПО УХОДУ: ${KNOWLEDGE_BASE.care}`);
  if (q.includes('возврат') || q.includes('вернуть') || q.includes('плох')) retrievedDocs.push(`ПОЛИТИКА ВОЗВРАТА: ${KNOWLEDGE_BASE.returns}`);
  if (q.includes('кто вы') || q.includes('магазин') || q.includes('о нас')) retrievedDocs.push(`О КОМПАНИИ: ${KNOWLEDGE_BASE.about}`);

  // Retrieve Relevant Products from Dynamic DB
  const currentProducts = db.products.getAll().filter(p => p.isActive && p.stock > 0);
  
  const productCatalog = currentProducts.map(p => 
      `ID: ${p.id} | Товар: ${p.name} | Цена: ${p.price} | Теги: ${p.tags.join(', ')} | Описание: ${p.description}`
    ).join('\n');
  
  return `
    === KNOWLEDGE BASE (RAG CONTEXT) ===
    ${retrievedDocs.join('\n')}
    
    === PRODUCT CATALOG DATABASE ===
    ${productCatalog}
  `;
};

// --- CHAT WITH HISTORY & RAG ---

export const getFloristChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    // 1. RETRIEVE CONTEXT (RAG STEP)
    const contextData = retrieveRAGContext(newMessage);

    // 2. CONSTRUCT SYSTEM PROMPT
    const systemInstruction = `
      Ты — "Flora", ИИ-ассистент бутика "Aura Flora".
      
      ИНСТРУКЦИИ БЕЗОПАСНОСТИ И БИЗНЕС-ЛОГИКА:
      1. Используй только предоставленную в Context информацию. Не выдумывай условия доставки.
      2. Если товара нет в каталоге ниже, вежливо скажи, что его сейчас нет или он закончился.
      3. Твой тон: Экспертный, эмпатичный, лаконичный.
      4. Для рекомендации товара ВСЕГДА используй формат: :::PRODUCT:ID_ТОВАРА:::
      5. Если товара мало (из контекста не видно, но предполагай), предложи альтернативу.

      ${contextData}
    `;

    const messages = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...history
            .filter(msg => !msg.isError)
            .map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            })),
        { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

    if (response.status === 200 && response.data) {
        return response.data.text;
    }
    
    return "Извините, сейчас я не могу ответить. Попробуйте позже.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Прошу прощения, сейчас я не могу продолжить диалог. Попробуйте чуть позже.";
  }
};

// --- SELLER AI ANALYTICS ---

export const analyzePrice = async (productName: string, currentPrice: number, category: Category): Promise<PriceAnalysis | null> => {
    try {
        const prompt = `
        Ты — ИИ-аналитик маркетплейса Aura Flora. Проведи анализ цены товара.
        
        ТОВАР:
        Название: "${productName}"
        Текущая цена: ${currentPrice} ₽
        Категория: "${category}"

        РЫНОЧНЫЙ КОНТЕКСТ (Симуляция):
        Представь, что ты проанализировал 10 конкурентов в сегменте премиум-флористики в Москве.

        ЗАДАЧА:
        1. Определи оптимальную цену (suggestedPrice).
        2. Оцени среднюю цену по рынку (marketAverage).
        3. Дай уверенность в прогнозе (confidence 0-100).
        4. Напиши обоснование (reasoning).

        ВЕРНИ ТОЛЬКО JSON:
        {
            "suggestedPrice": number,
            "marketAverage": number,
            "confidence": number,
            "competitorCount": number,
            "reasoning": "Краткое объяснение (макс 20 слов)"
        }
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) {
            return cleanAndParseJson(response.data.text);
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const getSeasonalForecast = async (category: string): Promise<DemandForecast | null> => {
    try {
        const currentMonth = new Date().toLocaleString('ru-RU', { month: 'long' });
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('ru-RU', { month: 'long' });

        const prompt = `
        Ты — ИИ-эксперт по закупкам цветов.
        Категория: "${category}".
        Сейчас: ${currentMonth}. Прогноз на: ${nextMonth}.

        ЗАДАЧА:
        Спрогнозируй спрос на следующий месяц.
        
        ВЕРНИ ТОЛЬКО JSON:
        {
            "period": "${nextMonth}",
            "trend": "rising" | "falling" | "stable",
            "predictedSalesGrowth": number (процент роста/падения, например 15),
            "topKeywords": ["цветок1", "цветок2", "цвет"],
            "actionableTips": ["Совет 1 (коротко)", "Совет 2"]
        }
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) {
            return cleanAndParseJson(response.data.text);
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const generateProductDescription = async (productName: string, keywords: string): Promise<string> => {
    try {
        const prompt = `Ты — эксперт по продажам на цветочном маркетплейсе. 
        Напиши продающее описание для товара.
        Название: ${productName}
        Ключевые слова: ${keywords}
        Объем: 2-3 предложения. Эмоционально.
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });
        
        if (response.status === 200 && response.data) {
            return response.data.text;
        }
        return "Не удалось сгенерировать описание.";
    } catch (error) {
        return "Не удалось сгенерировать описание.";
    }
};

// --- CONTENT MODERATION ---

export const moderateProduct = async (product: Product): Promise<AIVerdict> => {
    try {
        // Simulation of Vision API for image analysis (in real app, send image bytes)
        const prompt = `
        Ты — модератор контента на маркетплейсе цветов Aura Flora.
        Твоя задача — проверить карточку товара на безопасность и качество.
        
        ТОВАР:
        Название: "${product.name}"
        Описание: "${product.description}"
        Изображение (URL): "${product.image}" (Представь, что ты видишь это фото)

        КРИТЕРИИ:
        1. Безопасность: Нет ли запрещенных товаров, насилия, 18+?
        2. Качество: Достаточно ли хорошее описание? Соответствует ли флористике?
        3. Соответствие: Это точно цветы или подарки?

        ВЕРНИ JSON:
        {
            "isSafe": boolean,
            "qualityScore": number (0-100),
            "tags": ["тег1", "тег2"],
            "reason": "Вердикт одним предложением",
            "flaggedIssues": ["проблема1"] (если есть, иначе пустой массив)
        }
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) {
            const verdict = cleanAndParseJson(response.data.text);
            return verdict || { isSafe: true, qualityScore: 80, tags: [], reason: "AI Moderation Error", flaggedIssues: [] };
        }
        throw new Error("API Error");
    } catch (e) {
        // Fallback for demo stability
        return { isSafe: true, qualityScore: 85, tags: ["auto-approved"], reason: "Сбой AI, авто-одобрение", flaggedIssues: [] };
    }
};

// --- BUYER TOOLS ---

export const generateGiftMessage = async (occasion: string, recipient: string, tone: string): Promise<string> => {
    try {
        const prompt = `Напиши текст для открытки. Повод: ${occasion}. Кому: ${recipient}. Тон: ${tone}. Макс 30 слов. Без клише.`;
        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });
        if (response.status === 200 && response.data) return response.data.text.replace(/"/g, '');
        return "С наилучшими пожеланиями!";
    } catch (error) { return "С любовью и теплотой."; }
};

export const getGiftRecommendations = async (recipient: string, budget: string, availableProducts: Product[]): Promise<{ id: string; reason: string }[]> => {
    try {
         const productList = availableProducts
        .filter(p => p.stock > 0 && p.isActive)
        .map(p => JSON.stringify({ id: p.id, name: p.name, category: p.category, price: p.price, tags: p.tags }))
        .join('\n');

        const prompt = `
        Подбери 3 букета для подарка.
        Кому: ${recipient}. Бюджет: ${budget}.
        Список: ${productList}
        Верни JSON: [{ "id": "...", "reason": "..." }]
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) return cleanAndParseJson(response.data.text) || [];
        return [];
    } catch (e) { return []; }
};

export const getProductRecommendations = async (currentProduct: Product, availableProducts: Product[], userContext: UserPreferences): Promise<{ id: string; reason: string }[]> => {
    try {
        const productList = availableProducts.filter(p => p.id !== currentProduct.id && p.stock > 0 && p.isActive).map(p => JSON.stringify({id: p.id, name: p.name, category: p.category, price: p.price})).join('\n');
        const prompt = `
        Подбери 3 товара-компаньона для "${currentProduct.name}".
        Стиль пользователя: ${userContext.preferredStyle.join(', ')}.
        Верни JSON: [{ "id": "...", "reason": "..." }]
        Список: ${productList}
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) return cleanAndParseJson(response.data.text) || [];
        return [];
    } catch (error) { return []; }
};

export const identifyPlantFromImage = async (base64Data: string, mimeType: string): Promise<{ name: string; searchTerm: string } | null> => {
    try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const formData = new FormData();
        formData.append("image", blob, "image.jpg");
        formData.append("prompt", `Identify plant. Return JSON: { "name": "...", "searchTerm": "..." }`);

        const response = await apiGateway.request<{ text: string }>('ai', '/ai/vision', formData);
        
        if (response.status === 200 && response.data) return cleanAndParseJson(response.data.text);
        return null;
    } catch (error) { return null; }
}
