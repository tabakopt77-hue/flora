import fetch from 'node-fetch';

async function checkAll() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  const businessId = 216707839;
  
  console.log('Проверяем без фильтров...');
  
  try {
    const response = await fetch('https://api.partner.market.yandex.ru/v2/businesses/' + businessId + '/offer-mappings.json', {
      method: 'POST',
      headers: {
        'Api-Key': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    console.log('Всего товаров без фильтров:', data.result?.offerMappings?.length);
    console.log('Paging info:', data.result?.paging);
  } catch (e) {
    console.error(e);
  }
}

checkAll();
