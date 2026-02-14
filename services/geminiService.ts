import { GoogleGenAI } from "@google/genai";
import { Product, UserPreferences } from "../types";

// Helper to initialize AI client safely
const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const getFloristAdvice = async (userQuery: string): Promise<string> => {
  if (!process.env.API_KEY) return "Извините, я не могу связаться с сервером прямо сейчас (Отсутствует API Key).";

  try {
    const ai = getAiClient();
    const systemInstruction = `
      Ты — "Flora", профессиональный флорист-консультант премиального бутика "Bloom & Wisp".
      Твой тон: вежливый, теплый, интеллигентный, с легким оттенком элегантности. Обращайся к клиенту на "Вы".
      
      Твои задачи:
      1. Помогать с выбором цветов (повод, бюджет, отношения, сезонность).
      2. Давать советы по уходу за растениями.
      3. Предлагать эстетичные сочетания.

      Правила общения:
      - Язык: Только русский.
      - Стиль: Избегай сухих фраз. Используй "вкусные" описания (например, "бархатистые лепестки", "тонкий аромат").
      - Краткость: Ответ должен быть емким (до 100 слов), но полезным.
      - Конкретика: Всегда предлагай конкретные названия цветов.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: { systemInstruction }
    });

    return response.text || "Мне нужно немного подумать, чтобы подобрать для вас идеальный вариант. Спросите еще раз?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Прошу прощения, сейчас я не могу проконсультировать вас. Пожалуйста, попробуйте чуть позже.";
  }
};

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
      Роль: Ты — Flora, ИИ-флорист с безупречным вкусом.
      Задача: Подобрать 3 идеальных товара-компаньона (cross-sell/upsell) для текущего просмотра.

      КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ (Учитывай менталитет и вкус):
      - Любимый стиль: ${userContext.preferredStyle.length > 0 ? userContext.preferredStyle.join(', ') : 'Классическая элегантность'}
      - Палитра: ${userContext.favoriteColors.length > 0 ? userContext.favoriteColors.join(', ') : 'Натуральные оттенки'}
      - История покупок: ${userContext.pastPurchases.length > 0 ? userContext.pastPurchases.join(', ') : 'Новый гость'}
      - Поводы: ${userContext.recentOccasions.length > 0 ? userContext.recentOccasions.join(', ') : 'Без повода'}

      ТЕКУЩИЙ ТОВАР:
      - Название: "${currentProduct.name}" (${currentProduct.category})
      - Теги: ${currentProduct.tags.join(', ')}

      СТРАТЕГИЯ ПОДБОРА:
      1. Гармония: Товары должны эстетически сочетаться. К букету — вазу. К растению — кашпо или похожее растение для "зеленого уголка".
      2. Стиль: Если пользователь любит "Бохо", не предлагай строгую классику.
      3. Логика: Если смотрят свадебный букет, предложи декор.

      ДОСТУПНЫЕ ТОВАРЫ:
      ${productList}

      ФОРМАТ ОТВЕТА:
      Строго JSON массив объектов. Каждый объект должен иметь поля:
      - "id": ID товара
      - "reason": Объяснение (макс 12 слов) на русском языке, почему этот товар идеально дополняет выбранный. Например: "Подчеркивает глубину красных роз" или "Идеальная пара для весеннего настроения".
      
      Пример: [{"id": "id_1", "reason": "Гармонично дополняет палитру букета"}, {"id": "id_2", "reason": "Создает законченный образ в интерьере"}]
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
    
    // Ensure clean JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Recs Error:", error);
    return [];
  }
};