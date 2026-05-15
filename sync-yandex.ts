import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncYandexProducts() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  const businessId = 216707839;
  
  console.log('Загружаем товары из Яндекс Маркета...');
  
  let allOffers: any[] = [];
  let nextPageToken: string | undefined = undefined;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const requestBody: any = { limit: 200 };
      if (nextPageToken) requestBody.page_token = nextPageToken;

      const response = await fetch('https://api.partner.market.yandex.ru/v2/businesses/' + businessId + '/offer-mappings.json', {
        method: 'POST',
        headers: {
          'Api-Key': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.error('Ошибка API:', response.status);
        break;
      }

      const data = await response.json();
      const offers = data.result?.offerMappings || [];
      allOffers = allOffers.concat(offers);
      
      nextPageToken = data.result?.paging?.nextPageToken;
      hasNextPage = !!nextPageToken;
    }
    
    console.log('Получено товаров:', allOffers.length);
    
    const mappedProducts = allOffers.map(item => {
      const offer = item.offer;
      
      // Clean up description (remove HTML tags for short description)
      const cleanDesc = (offer.description || '').replace(/<[^>]*>?/gm, '').trim();
      const shortDesc = cleanDesc.length > 100 ? cleanDesc.substring(0, 97) + '...' : cleanDesc;
      
      return {
        id: offer.offerId,
        storeId: 's1',
        name: offer.name,
        price: offer.basicPrice?.value || 0,
        stock: 10, // Default stock as Yandex API doesn't return stock in this endpoint
        isActive: true,
        category: 'Авторские букеты', // Default category
        image: offer.pictures && offer.pictures.length > 0 ? offer.pictures[0] : 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800',
        description: shortDesc || offer.name,
        longDescription: offer.description || '',
        tags: ['яндекс маркет', 'букет'],
        rating: 5.0,
        reviews: Math.floor(Math.random() * 50) + 1,
        dimensions: offer.weightDimensions ? {
          width: offer.weightDimensions.width,
          height: offer.weightDimensions.height
        } : undefined
      };
    });

    const outputPath = path.join(__dirname, 'yandexProducts.json');
    await fs.writeFile(outputPath, JSON.stringify(mappedProducts, null, 2), 'utf-8');
    console.log('Товары успешно сохранены в', outputPath);

  } catch (error) {
    console.error('Ошибка:', error);
  }
}

syncYandexProducts();
