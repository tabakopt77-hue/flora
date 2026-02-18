
import { Product, UserPreferences, ChatMessage } from "../types";
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
  about: "Bloom & Wisp — премиальный цветочный маркетплейс, объединяющий лучших флористов. Мы используем ИИ для проверки качества каждого букета перед отправкой."
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
      Ты — "Flora", ИИ-ассистент бутика "Bloom & Wisp".
      
      ИНСТРУКЦИИ БЕЗОПАСНОСТИ И БИЗНЕС-ЛОГИКА:
      1. Используй только предоставленную в Context информацию. Не выдумывай условия доставки.
      2. Если товара нет в каталоге ниже, вежливо скажи, что его сейчас нет или он закончился.
      3. Твой тон: Экспертный, эмпатичный, лаконичный.
      4. Для рекомендации товара ВСЕГДА используй формат: :::PRODUCT:ID_ТОВАРА:::
      5. Если товара мало (из контекста не видно, но предполагай), предложи альтернативу.

      ${contextData}
    `;

    // Map history to Backend API format (GeminiMessage)
    // Note: We inject system instruction as the first user message or handle it on backend if backend supported system instructions directly.
    // Here we prepend it to the conversation for simplicity as standard chat endpoint on backend handles messages.
    
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

// --- SELLER AI TOOLS ---

export const generateProductDescription = async (productName: string, keywords: string): Promise<string> => {
    try {
        const prompt = `Ты — эксперт по продажам на цветочном маркетплейсе. 
        Напиши продающее, вдохновляющее описание для товара.
        Название: ${productName}
        Ключевые особенности: ${keywords}
        
        Требования:
        - Текст должен быть эмоциональным, вызывать желание купить.
        - Объем: 2-3 предложения (до 50 слов).
        - Используй сенсорную лексику (аромат, текстура, чувства).
        - Язык: Русский.`;

        // We can reuse the chat endpoint for single-turn tasks
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

// --- BUYER & LEGACY TOOLS ---

export const generateGiftMessage = async (occasion: string, recipient: string, tone: string): Promise<string> => {
    try {
        const prompt = `Напиши текст для открытки к цветам на русском языке.
        Повод: ${occasion}
        Кому: ${recipient}
        Тон сообщения: ${tone} (например: романтичный, официальный, теплый дружеский).
        
        Требования:
        - Максимум 30 слов.
        - Без банальностей вроде "Счастья, здоровья".
        - Текст должен быть душевным и искренним.
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) {
            return response.data.text.replace(/"/g, '');
        }
        return "С наилучшими пожеланиями!";
    } catch (error) {
        return "С любовью и теплотой.";
    }
};

export const getProductRecommendations = async (
  currentProduct: Product,
  availableProducts: Product[],
  userContext: UserPreferences
): Promise<{ id: string; reason: string }[]> => {
    try {
        const productList = availableProducts
        .filter(p => p.id !== currentProduct.id && p.stock > 0 && p.isActive)
        .map(p => JSON.stringify({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            tags: p.tags,
            description: p.description
        }))
        .join('\n');

        const prompt = `
        Роль: Ты — Flora, ИИ-флорист с безупречным вкусом и эмпатией.
        Задача: Подобрать 3 идеальных товара-компаньона для текущего просмотра, опираясь на "Цифровой Слепок" вкуса клиента.

        1. ЦИФРОВОЙ СЛЕПОК КЛИЕНТА:
        • Стиль: ${userContext.preferredStyle.join(', ')}
        • Цвета: ${userContext.favoriteColors.join(', ')}
        • Повод: ${userContext.recentOccasions.join(', ')}

        2. АНАЛИЗИРУЕМЫЙ ТОВАР:
        - Название: "${currentProduct.name}"
        - Категория: ${currentProduct.category}

        3. СТРАТЕГИЯ ПОДБОРА:
        - Исключи текущий товар.
        - Найди 3 товара, которые эстетически дополняют текущий.
        - Объясни выбор (reason) на русском языке.
        - ВЕРНИ ОТВЕТ ТОЛЬКО В ФОРМАТЕ JSON: [{ "id": "...", "reason": "..." }]

        ДОСТУПНЫЕ ТОВАРЫ:
        ${productList}
        `;

        const messages = [{ role: 'user', parts: [{ text: prompt }] }];
        const response = await apiGateway.request<{ text: string }>('ai', '/ai/chat', { messages });

        if (response.status === 200 && response.data) {
             return cleanAndParseJson(response.data.text) || [];
        }
        return [];
    } catch (error) {
        console.error("AI Recs Error:", error);
        return [];
    }
};

export const identifyPlantFromImage = async (base64Data: string, mimeType: string): Promise<{ name: string; searchTerm: string } | null> => {
    try {
        // We need to convert base64 to Blob/File to send as FormData or send as JSON with base64 if backend supports it.
        // The backend `vision` endpoint uses `Multipart` form data. 
        // We need to convert base64 back to a blob to send via FormData.
        
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const formData = new FormData();
        formData.append("image", blob, "image.jpg");
        formData.append("prompt", `Identify this plant or flower. 
            Return a JSON object with:
            - 'name': The name of the flower/plant in Russian.
            - 'searchTerm': A general keyword to search for this flower (in Russian).
            Example: { "name": "Роза", "searchTerm": "розы" }
            RETURN ONLY JSON.
        `);

        const response = await apiGateway.request<{ text: string }>('ai', '/ai/vision', formData);
        
        if (response.status === 200 && response.data) {
             return cleanAndParseJson(response.data.text);
        }
        return null;
    } catch (error) {
        console.error("Vision API Error:", error);
        return null;
    }
}
