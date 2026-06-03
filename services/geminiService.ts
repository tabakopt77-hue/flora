
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Order, UserPreferences, ChatMessage, PriceAnalysis, DemandForecast, Category, AIVerdict } from "../types";
import { db } from "./db";

// Initialize Gemini API
// Note: In a real production app, you might want to proxy this through a backend to hide the API key,
// but for this client-side demo, we use the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  shipping: "Доставка осуществляется по Москве: Пешим курьером Достависта (400 руб), Экспресс на такси по тарифу Яндекс (800 руб), и курьером Floramos (300 руб). Бесплатная стандартная доставка при заказе от 10 000 руб. С SafeRoute больше не сотрудничаем. Интервалы доставки: 10-14, 14-18, 18-22.",
  care: "Общие правила ухода: Подрезайте стебли под углом 45 градусов. Используйте чистую прохладную воду. Меняйте воду раз в 2 дня. Не ставьте цветы на сквозняке, у батарей или под прямые солнечные лучи.",
  returns: "Цветы являются товаром надлежащего качества, не подлежащим возврату (Постановление РФ №55). Однако, если букет приехал вялым, мы заменим его в течение 24 часов. пришлите фото в течение часа после получения.",
  about: "Floramos — маркетплейс от людей и для людей. Мы, возможно, не первые на рынке, но стараемся быть лучшими и делаем всё как для себя. Объединяем трудолюбивых флористов, искренне стараемся помогать покупателям найти букет по душе, а ИИ помогает нам в проверках."
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

export const getFloristChatResponse = async (history: ChatMessage[], newMessage: string, newImage?: string, creativity: number = 5): Promise<string> => {
  try {
    // 1. RETRIEVE CONTEXT (RAG STEP)
    const contextData = retrieveRAGContext(newMessage);

    // 2. CONSTRUCT SYSTEM PROMPT
    const systemInstruction = `
      Ты — "Flora", ИИ-ассистент бутика "Floramos".
      
      ГЛАВНАЯ ДИРЕКТИВА:
      Ты общаешься ИСКЛЮЧИТЕЛЬНО на тему цветов, букетов, подарков, оформления и ухода за растениями.
      Если пользователь задает вопрос не по теме (политика, погода, новости, личные вопросы и т.д.), ты вежливо, но твердо отказываешься отвечать и переводишь тему обратно на цветы.
      
      Пример отказа: "Извините, но я разбираюсь только в цветах и красоте. Давайте лучше подберем букет для вашей мамы?"
      
      ИНСТРУКЦИИ БЕЗОПАСНОСТИ И БИЗНЕС-ЛОГИКА:
      1. Используй только предоставленную в Context информацию. Не выдумывай условия доставки.
      2. Если товара нет в каталоге ниже, вежливо скажи, что его сейчас нет или он закончился.
      3. Твой тон: Экспертный, эмпатичный, лаконичный, "цветочный".
      4. Для рекомендации товара ВСЕГДА используй формат: :::PRODUCT:ID_ТОВАРА:::
      5. Если товара мало (из контекста не видно, но предполагай), предложи альтернативу.
      6. Активно предлагай оформить заказ, спрашивай о поводе и предпочтениях.
      7. Если пользователь прикрепил фото, проанализируй его и предложи похожие товары из базы или прокомментируй цветы на фото.

      ${contextData}
    `;

    const contents = history
        .filter(msg => !msg.isError)
        .map(msg => {
            const parts: any[] = [];
            if (msg.image) {
                const match = msg.image.match(/^data:(image\/\w+);base64,(.*)$/);
                if (match) {
                    parts.push({
                        inlineData: {
                            mimeType: match[1],
                            data: match[2]
                        }
                    });
                }
            }
            parts.push({ text: msg.text || " " });
            return {
                role: msg.role === 'model' ? 'model' : 'user',
                parts: parts
            };
        });

    const newUserParts: any[] = [];
    if (newImage) {
        const match = newImage.match(/^data:(image\/\w+);base64,(.*)$/);
        if (match) {
            newUserParts.push({
                inlineData: {
                    mimeType: match[1],
                    data: match[2]
                }
            });
        }
    }
    newUserParts.push({ text: newMessage || " " });
    contents.push({ role: 'user', parts: newUserParts });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            temperature: creativity / 10, // creativity comes in as 1-10
        }
    });

    return response.text || "Извините, сейчас я не могу ответить. Попробуйте позже.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Прошу прощения, сейчас я не могу продолжить диалог. Попробуйте чуть позже.";
  }
};

// --- SELLER AI ANALYTICS ---

export const analyzePrice = async (productName: string, currentPrice: number, category: Category): Promise<PriceAnalysis | null> => {
    try {
        const prompt = `
        Ты — ИИ-аналитик маркетплейса Floramos. Проведи анализ цены товара.
        
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
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedPrice: { type: Type.NUMBER },
                        marketAverage: { type: Type.NUMBER },
                        confidence: { type: Type.NUMBER },
                        competitorCount: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    }
                }
            }
        });

        return cleanAndParseJson(response.text);
    } catch (e) {
        console.error("Price Analysis Error:", e);
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
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        period: { type: Type.STRING },
                        trend: { type: Type.STRING, enum: ["rising", "falling", "stable"] },
                        predictedSalesGrowth: { type: Type.NUMBER },
                        topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        return cleanAndParseJson(response.text);
    } catch (e) {
        console.error("Forecast Error:", e);
        return null;
    }
};

export interface DbDemandForecast {
  period: string;
  trend: 'rising' | 'falling' | 'stable';
  predictedSalesGrowth: number;
  topKeywords: string[];
  actionableTips: string[];
  demandByVariety: {
    name: string;
    currentStock: number;
    predictedDemandScore: number;
    recommendation: 'increase' | 'maintain' | 'reduce';
    confidence: number;
    details: string;
  }[];
}

export const getDbFlowerDemandForecast = async (
  products: Product[],
  orders: Order[]
): Promise<DbDemandForecast | null> => {
    try {
        const currentMonth = new Date().toLocaleString('ru-RU', { month: 'long' });
        const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('ru-RU', { month: 'long' });

        // Summarize items in database
        const productSummary = products.slice(0, 15).map(p => ({
            name: p.name,
            category: p.category,
            stock: p.stock,
            price: p.price
        }));

        // Summarize orders in database
        const orderSummary = orders.slice(0, 15).map(o => ({
            id: o.id,
            date: o.date,
            total: o.total,
            status: o.status,
            itemCount: o.items.length,
            itemNames: o.items.map((item: { name: string }) => item.name).join(', ')
        }));

        const prompt = `
        Ты — ведущий ИИ-аналитик логистики и планирования закупок для флористического маркетплейса "Floramos".
        Текущий месяц: ${currentMonth}. Мы прогнозируем спрос на следующий месяц: ${nextMonth}.

        ДАННЫЕ ИЗ БАЗЫ:
        - Всего уникальных товаров в каталоге: ${products.length}
        - Пример списка товаров: ${JSON.stringify(productSummary)}
        - Всего заказов в базе: ${orders.length}
        - Детализация последних заказов: ${JSON.stringify(orderSummary)}

        УКАЗАНИЯ ДЛЯ АНАЛИЗА:
        1. Если в базе еще нет реальных заказов (orders.length === 0), проведи аналитический прогноз на основе имеющихся сортов в каталоге и их складских запасов (stock).
        2. Распознай ключевые виды цветов из названий товаров (например: "роза Athena", "пион", "гортензия", "гипсофила", "тюльпан") и сгруппируй спрос по этим категориям/сортам в поле 'demandByVariety'.
        3. Спрогнозируй ожидаемое изменение спроса на следующий месяц в процентах (predictedSalesGrowth) и определи общий тренд (trend: "rising" - рост, "falling" - спад, "stable" - стабильно).
        4. Сформулируй 3-4 точечных практических совета по закупкам тюльпанов, роз или сезонных сортов в 'actionableTips' на русском языке.
        5. Для каждого ключевого сорта в 'demandByVariety' (составь список из 4-5 ключевых сортов роз, пионов, кустовых цветов или коробок) выдай:
           - currentStock: текущие остатки на складе (суммируй или оцени по товарам в базе)
           - predictedDemandScore: прогнозируемый балл спроса от 1 до 100
           - recommendation: рекомендация ("increase" - увеличить закупки, "maintain" - оставить текущий уровень, "reduce" - распродать остатки/снизить закупку)
           - confidence: уверенность в прогнозе (%)
           - details: конкретное обоснование рекомендации на русском языке.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        period: { type: Type.STRING },
                        trend: { type: Type.STRING, enum: ["rising", "falling", "stable"] },
                        predictedSalesGrowth: { type: Type.NUMBER },
                        topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                        demandByVariety: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    currentStock: { type: Type.NUMBER },
                                    predictedDemandScore: { type: Type.NUMBER },
                                    recommendation: { type: Type.STRING, enum: ["increase", "maintain", "reduce"] },
                                    confidence: { type: Type.NUMBER },
                                    details: { type: Type.STRING }
                                },
                                required: ["name", "currentStock", "predictedDemandScore", "recommendation", "confidence", "details"]
                            }
                        }
                    },
                    required: ["period", "trend", "predictedSalesGrowth", "topKeywords", "actionableTips", "demandByVariety"]
                }
            }
        });

        return cleanAndParseJson(response.text);
    } catch (e) {
        console.error("Db Forecast Error:", e);
        return null;
    }
};

export const generateProductDescription = async (productName: string, keywords: string) => {
    try {
        const prompt = `Ты — эксперт по продажам на цветочном маркетплейсе. 
        Напиши продающее описание для товара.
        Название: "${productName}"
        Ключевые слова: "${keywords}"
        
        Верни JSON с двумя полями:
        - short: Краткое описание (2-3 предложения, эмоционально, интригующе)
        - long: Длинное описание (для карточки товара, с подробностями, атмосферой и плюсами)`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        short: { type: Type.STRING },
                        long: { type: Type.STRING }
                    }
                }
            }
        });
        
        return cleanAndParseJson(response.text);
    } catch (error) {
        console.error("Description Gen Error:", error);
        return null;
    }
};

// --- CONTENT MODERATION ---

export const moderateProduct = async (product: Product): Promise<AIVerdict> => {
    try {
        // Simulation of Vision API for image analysis (in real app, send image bytes)
        const prompt = `
        Ты — модератор контента на маркетплейсе цветов Floramos.
        Твоя задача — проверить карточку товара на безопасность и качество.
        
        ТОВАР:
        Название: "${product.name}"
        Описание: "${product.description}"
        Изображение (URL): "${product.image}" (Представь, что ты видишь это фото)

        КРИТЕРИИ:
        1. Безопасность: Нет ли запрещенных товаров, насилия, 18+?
        2. Качество: Достаточно ли хорошее описание? Соответствует ли флористике?
        3. Соответствие: Это точно цветы или подарки?
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isSafe: { type: Type.BOOLEAN },
                        qualityScore: { type: Type.NUMBER },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reason: { type: Type.STRING },
                        flaggedIssues: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        const verdict = cleanAndParseJson(response.text);
        return verdict || { isSafe: true, qualityScore: 80, tags: [], reason: "AI Moderation Error", flaggedIssues: [] };
    } catch (e) {
        // Fallback for demo stability
        return { isSafe: true, qualityScore: 85, tags: ["auto-approved"], reason: "Сбой AI, авто-одобрение", flaggedIssues: [] };
    }
};

// --- BUYER TOOLS ---

export const generateGiftMessage = async (occasion: string, recipient: string, tone: string): Promise<string> => {
    try {
        const prompt = `Напиши текст для открытки. Повод: ${occasion}. Кому: ${recipient}. Тон: ${tone}. Макс 30 слов. Без клише.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.replace(/"/g, '') || "С наилучшими пожеланиями!";
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
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        return cleanAndParseJson(response.text) || [];
    } catch (e) { return []; }
};

export const getProductRecommendations = async (currentProduct: Product, availableProducts: Product[], userContext: UserPreferences): Promise<{ id: string; reason: string }[]> => {
    try {
        const productList = availableProducts.filter(p => p.id !== currentProduct.id && p.stock > 0 && p.isActive).map(p => JSON.stringify({id: p.id, name: p.name, category: p.category, price: p.price})).join('\n');
        const prompt = `
        Подбери 3 товара-компаньона для "${currentProduct.name}".
        Стиль пользователя: ${userContext.preferredStyle.join(', ')}.
        Список: ${productList}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        return cleanAndParseJson(response.text) || [];
    } catch (error) { return []; }
};


export const summarizeReviews = async (reviewsText: string): Promise<string> => {
    try {
        const prompt = `
            Проанализируй отзывы покупателей о букете.
            Отзывы: "${reviewsText}"
            
            Напиши краткую выжимку (макс 30 слов).
            Формат: "Плюсы: ... Минусы: ..."
            Будь честным и объективным.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        
        return response.text || "Не удалось создать резюме.";
    } catch (e) {
        return "Не удалось создать резюме.";
    }
};

export const identifyPlantFromImage = async (base64Data: string, mimeType: string): Promise<{ name: string; searchTerm: string } | null> => {
    try {
        const prompt = `Identify plant. Return JSON: { "name": "...", "searchTerm": "..." }`;

        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                { text: prompt }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        searchTerm: { type: Type.STRING }
                    }
                }
            }
        });
        
        return cleanAndParseJson(response.text);
    } catch (error) { return null; }
}
