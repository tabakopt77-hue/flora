import fetch from 'node-fetch';

async function testYandexMarket() {
  const token = 'ACMA:p59zyxBqHpcO7nO2UDwDPGTSbq2kxYqGTJKmey1l:b45c56ad';
  
  console.log('Testing Yandex Market API with token...');
  
  try {
    const response = await fetch('https://api.partner.market.yandex.ru/v2/campaigns.json', {
      headers: {
        'Api-Key': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching campaigns:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      
      console.log('\\nTrying alternative Authorization header...');
      const altResponse = await fetch('https://api.partner.market.yandex.ru/v2/campaigns.json', {
        headers: {
          'Authorization': 'OAuth oauth_token="' + token + '", oauth_client_id="test"',
          'Content-Type': 'application/json'
        }
      });
      
      if (!altResponse.ok) {
        console.error('Alternative auth also failed:', altResponse.status, altResponse.statusText);
        const altText = await altResponse.text();
        console.error('Response body:', altText);
        return;
      } else {
        const altData = await altResponse.json();
        console.log('Success with alternative auth! Campaigns:', JSON.stringify(altData, null, 2));
        return;
      }
    }

    const data = await response.json();
    console.log('Success! Campaigns:', JSON.stringify(data, null, 2));
    
    if (data.campaigns && data.campaigns.length > 0) {
      const campaignId = data.campaigns[0].id;
      console.log('\\nFetching offers for campaign ' + campaignId + '...');
      
      const offersResponse = await fetch('https://api.partner.market.yandex.ru/v2/campaigns/' + campaignId + '/offers.json', {
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
      }
    }
    
  } catch (error) {
    console.error('Network or parsing error:', error);
  }
}

testYandexMarket();
