import fetch from 'node-fetch';

async function testYandexMarket() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  const campaignId = 149035064;
  
  console.log('Fetching offers for campaign ' + campaignId + '...');
  
  try {
    const offersResponse = await fetch('https://api.partner.market.yandex.ru/v2/campaigns/' + campaignId + '/offer-mapping-entries.json', {
      headers: {
        'Api-Key': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (offersResponse.ok) {
      const offersData = await offersResponse.json();
      console.log('Offers:', JSON.stringify(offersData, null, 2));
    } else {
      console.error('Error fetching offers:', offersResponse.status, offersResponse.statusText);
      const text = await offersResponse.text();
      console.error('Response body:', text);
    }
  } catch (error) {
    console.error('Network or parsing error:', error);
  }
}

testYandexMarket();
