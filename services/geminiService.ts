import { GoogleGenAI, Content } from "@google/genai";
import { Product, UserPreferences, ChatMessage } from "../types";
import { PRODUCTS } from "../constants";

// Helper to initialize AI client safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

// --- CHAT WITH HISTORY SUPPORT ---

export const getFloristChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  if (!process.env.API_KEY) return "Извините, я не могу связаться с сервером прямо сейчас (Отсутствует API Key).";

  try {
    const ai = getAiClient();
    
    // Create a catalog string for the AI
    const catalogContext = PRODUCTS.map(p => 
      `ID: ${p.id} | Название: ${p.name} | Цена: ${p.price} | Категория: ${p.category} | Описание: ${p.description}`
    ).join('\n');

    // Convert internal ChatMessage[] to Gemini's expected Content[] format for history
    const chatHistory: Content[] = history
      .filter(msg => !msg.isError)
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

    const systemInstruction = `
      Ты — "Flora", профессиональный флорист-консультант премиального бутика "Bloom & Wisp".
      Твой тон: вежливый, теплый, интеллигентный, с легким оттенком элегантности. Обращайся к клиенту на "Вы".
      
      Твои задачи:
      1. Помогать с выбором цветов (повод, бюджет, отношения, сезонность).
      2. Предлагать товары ИСКЛЮЧИТЕЛЬНО из нашего каталога.
      
      КАТАЛОГ МАГАЗИНА:
      ${catalogContext}

      ВАЖНОЕ ПРАВИЛО РЕКОМЕНДАЦИЙ:
      Если ты понимаешь, что какой-то товар из каталога подходит клиенту, ты должна предложить его и вставить специальный код в конце предложения.
      Формат кода: :::PRODUCT:ID_ТОВАРА:::
      
      Пример:
      "Для такого романтического повода идеально подойдет наша классика. Обратите внимание на этот букет.
      :::PRODUCT:2:::
      Он выразит ваши чувства лучше слов."

      Правила общения:
      - Язык: Только русский.
      - Не выдумывай товары, которых нет в списке.
      - Ответ должен быть емким (до 100 слов).
    `;

    // Create a chat session with the previous history
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: chatHistory,
      config: { systemInstruction }
    });

    // Send the NEW message
    const response = await chat.sendMessage({ message: newMessage });

    return response.text || "Мне нужно немного подумать. Можете переформулировать?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Прошу прощения, сейчас я не могу продолжить диалог. Попробуйте чуть позже.";
  }
};

// --- SELLER AI TOOLS ---

export const generateProductDescription = async (productName: string, keywords: string): Promise<string> => {
  if (!process.env.API_KEY) return "Описание не сгенерировано (нет ключа).";

  try {
    const ai = getAiClient();
    const prompt = `Ты — эксперт по продажам на цветочном маркетплейсе. 
    Напиши продающее, вдохновляющее описание для товара.
    Название: ${productName}
    Ключевые особенности: ${keywords}
    
    Требования:
    - Текст должен быть эмоциональным, вызывать желание купить.
    - Объем: 2-3 предложения (до 50 слов).
    - Используй сенсорную лексику (аромат, текстура, чувства).
    - Язык: Русский.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Красивый букет свежих цветов.";
  } catch (error) {
    return "Не удалось сгенерировать описание.";
  }
};

// --- BUYER & LEGACY TOOLS ---

export const generateGiftMessage = async (occasion: string, recipient: string, tone: string): Promise<string> => {
  if (!process.env.API_KEY) return "С наилучшими пожеланиями!";

  try {
    const ai = getAiClient();
    const prompt = `Напиши текст для открытки к цветам на русском языке.
    Повод: ${occasion}
    Кому: ${recipient}
    Тон сообщения: ${tone} (например: романтичный, официальный, теплый дружеский).
    
    Требования:
    - Максимум 30 слов.
    - Без банальностей вроде "Счастья, здоровья".
    - Текст должен быть душевным и искренним.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.replace(/"/g, '') || "Пусть эти цветы подарят улыбку!";
  } catch (error) {
    return "С любовью и теплотой.";
  }
};

export const getProductRecommendations = async (
  currentProduct: Product,
  availableProducts: Product[],
  userContext: UserPreferences
): Promise<{ id: string; reason: string }[]> => {
  if (!process.env.API_KEY) return [];

  try {
    const ai = getAiClient();
    const productList = availableProducts
      .filter(p => p.id !== currentProduct.id)
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

      1. ЦИФРОВОЙ СЛЕПОК КЛИЕНТА (User Memory):
      ---------------------------------------------------
      • Эстетический код (Style DNA): ${userContext.preferredStyle.length > 0 ? userContext.preferredStyle.join(', ') : 'Тяга к классике'}
      • Цветовая палитра (Color Mood): ${userContext.favoriteColors.length > 0 ? userContext.favoriteColors.join(', ') : 'Нейтральные, природные тона'}
      • История отношений (Purchase History): ${userContext.pastPurchases.length > 0 ? userContext.pastPurchases.join(', ') : 'Первое знакомство'}
      • Эмоциональный контекст (Occasions): ${userContext.recentOccasions.length > 0 ? userContext.recentOccasions.join(', ') : 'Спонтанная радость'}
      ---------------------------------------------------

      2. АНАЛИЗИРУЕМЫЙ ТОВАР:
      - Название: "${currentProduct.name}"
      - Категория: ${currentProduct.category}
      - Описание: ${currentProduct.description}
      - Теги: ${currentProduct.tags.join(', ')}

      3. СТРАТЕГИЯ ПОДБОРА (Logic Flow):
      - Шаг 1: Исключи текущий товар.
      - Шаг 2: Найди товары, которые эстетически дополняют текущий.
      - Шаг 3: Проверь соответствие "Цифровому Слепку" клиента.
      - Шаг 4: Сформулируй причину рекомендации. Объясни, почему этот товар составляет идеальную пару с текущим (например: "Подчеркивает нежность бутонов" или "Идеальная ваза для высоких стеблей").

      ДОСТУПНЫЕ ТОВАРЫ:
      ${productList}

      ФОРМАТ ОТВЕТА (JSON):
      Массив из 3 объектов:
      [
        {
          "id": "ID товара",
          "reason": "Краткое объяснение совместимости (до 15 слов)."
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Recs Error:", error);
    throw error; // Rethrow to handle in component
  }
};

export const identifyPlantFromImage = async (base64Data: string, mimeType: string): Promise<{ name: string; searchTerm: string } | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const ai = getAiClient();
    const prompt = `Посмотри на это изображение. Что это за цветок или растение? 
    Верни JSON объект с двумя полями:
    1. "name": Название цветка на русском языке.
    2. "searchTerm": Одно или два ключевых слова для поиска этого цветка в магазине.
    Если это не цветок, верни null.`;

    // Use a general multimodal model instead of the image generation model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    const text = response.text;
    if (!text) return null;
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Vision API Error:", error);
    return null;
  }
}