import fetch from 'node-fetch';

async function checkArchived() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  const businessId = 216707839;
  
  console.log('Проверяем архивные товары...');
  
  try {
    const response = await fetch('https://api.partner.market.yandex.ru/v2/businesses/' + businessId + '/offer-mappings.json', {
      method: 'POST',
      headers: {
        'Api-Key': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 200,
        archived: true
      })
    });
    
    const data = await response.json();
    const offers = data.result?.offerMappings || [];
    console.log('Архивных товаров найдено: ' + offers.length);
  } catch (e) {
    console.error(e);
  }
}

checkArchived();
