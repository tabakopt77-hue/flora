import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function rewriteSEO() {
  console.log('Начинаем уникализацию текстов для SEO...');
  const productsPath = path.join(__dirname, 'yandexProducts.json');
  
  try {
    const data = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(data);
    
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.log(`Обработка товара ${i + 1}/${products.length}: ${p.name}`);
      
      const prompt = `
Ты профессиональный SEO-копирайтер и флорист. 
Уникализируй и улучши описание для букета цветов, чтобы оно продавало и выводило товар в топ поисковиков.
Название букета: "${p.name}"
Текущее описание: "${p.description}"

Верни результат строго в формате JSON:
{
  "description": "Краткое, цепляющее SEO-описание (до 120 символов)",
  "longDescription": "Подробное, красивое и продающее SEO-описание букета, его состава, повода для подарка и эмоций (3-4 предложения)."
}
`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        
        if (response.text) {
          const result = JSON.parse(response.text);
          p.description = result.description || p.description;
          p.longDescription = result.longDescription || p.longDescription;
          console.log('  Успешно обновлено.');
        }
      } catch (err) {
        console.error(`  Ошибка при обработке ${p.name}:`, err);
      }
      
      // Небольшая пауза, чтобы не превысить лимиты API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf-8');
    console.log('Все товары успешно уникализированы и сохранены!');
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

rewriteSEO();
