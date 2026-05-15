import fetch from 'node-fetch';

async function searchOffers() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  const campaignId = 149035064;
  
  console.log('Ищем товары через advanced-search для кампании ' + campaignId + '...');
  
  try {
    const response = await fetch('https://api.partner.market.yandex.ru/v2/campaigns/' + campaignId + '/offers/advanced-search.json', {
      method: 'POST',
      headers: {
        'Api-Key': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 200
      })
    });
    
    if (!response.ok) {
      console.log('Error:', response.status);
      console.log(await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('Найдено товаров (advanced-search):', data.result?.paging?.total || data.result?.offers?.length || 0);
  } catch (e) {
    console.error(e);
  }
}

searchOffers();
