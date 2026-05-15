import fetch from 'node-fetch';

async function fetchAllYandexProducts() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  const businessId = 216707839;
  
  console.log('Начинаем загрузку всех товаров для бизнеса ' + businessId + '...');
  
  let allOffers: any[] = [];
  let nextPageToken: string | undefined = undefined;
  let hasNextPage = true;
  let pageCount = 0;

  try {
    while (hasNextPage) {
      pageCount++;
      console.log('Запрашиваем страницу ' + pageCount + '...');
      
      const requestBody: any = {
        limit: 200 // Максимальный лимит для Яндекса
      };
      
      if (nextPageToken) {
        requestBody.page_token = nextPageToken;
      }

      const response = await fetch('https://api.partner.market.yandex.ru/v2/businesses/' + businessId + '/offer-mappings.json', {
        method: 'POST',
        headers: {
          'Api-Key': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.error('Ошибка API:', response.status, response.statusText);
        break;
      }

      const data = await response.json();
      const offers = data.result?.offerMappings || [];
      allOffers = allOffers.concat(offers);
      
      console.log('Получено товаров на странице: ' + offers.length + '. Всего собрано: ' + allOffers.length);
      
      nextPageToken = data.result?.paging?.nextPageToken;
      hasNextPage = !!nextPageToken;
    }
    
    console.log('\\nУспешно! Всего найдено товаров в вашем каталоге: ' + allOffers.length);
    
    // Выведем названия первых 5 и последних 5 для примера
    console.log('\\nПервые 5 товаров:');
    allOffers.slice(0, 5).forEach((o, i) => console.log((i + 1) + '. ' + o.offer.name));
    
    if (allOffers.length > 5) {
      console.log('...');
      console.log('\\nПоследние 5 товаров:');
      allOffers.slice(-5).forEach((o, i) => console.log((allOffers.length - 5 + i + 1) + '. ' + o.offer.name));
    }

  } catch (error) {
    console.error('Ошибка сети или парсинга:', error);
  }
}

fetchAllYandexProducts();
