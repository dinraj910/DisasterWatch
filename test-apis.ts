// Test external APIs directly
async function testUSGS() {
  try {
    console.log('🔍 Testing USGS API...');
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson');
    const data = await response.json();
    console.log('USGS Response Status:', response.status);
    console.log('USGS Features Count:', data.features?.length || 0);
    console.log('Sample USGS data:', JSON.stringify(data.features?.[0], null, 2));
  } catch (error) {
    console.error('❌ USGS Error:', error);
  }
}

async function testGDACS() {
  try {
    console.log('\n🔍 Testing GDACS API...');
    const response = await fetch('https://www.gdacs.org/xml/rss.xml');
    const text = await response.text();
    console.log('GDACS Response Status:', response.status);
    console.log('GDACS Response Length:', text.length);
    console.log('GDACS Sample:', text.substring(0, 500));
  } catch (error) {
    console.error('❌ GDACS Error:', error);
  }
}

async function testNWS() {
  try {
    console.log('\n🔍 Testing NWS API...');
    const response = await fetch('https://api.weather.gov/alerts/active');
    const data = await response.json();
    console.log('NWS Response Status:', response.status);
    console.log('NWS Features Count:', data.features?.length || 0);
    console.log('Sample NWS data:', JSON.stringify(data.features?.[0], null, 2));
  } catch (error) {
    console.error('❌ NWS Error:', error);
  }
}

async function runTests() {
  await testUSGS();
  await testGDACS();
  await testNWS();
}

runTests();
