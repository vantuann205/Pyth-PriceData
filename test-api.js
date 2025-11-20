// Script để test Pyth Network API
// Chạy: node test-api.js

const ADA_USD_PRICE_FEED_ID = "0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d";

async function testPythAPI() {
  console.log('🔍 Testing Pyth Network API...\n');
  console.log('✅ Không cần API key - Hoàn toàn miễn phí!\n');

  try {
    console.log('📡 Đang gọi Pyth Network API...');
    console.log(`   Endpoint: https://hermes.pyth.network/api/latest_price_feeds`);
    console.log(`   Price Feed ID: ${ADA_USD_PRICE_FEED_ID}\n`);
    
    const response = await fetch(
      `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${ADA_USD_PRICE_FEED_ID}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        const priceData = data[0];
        const priceInfo = priceData.price;
        
        // Tính giá thực
        const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
        const confidence = parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo);
        const timestamp = new Date(priceInfo.publish_time * 1000);
        
        console.log('✅ Thành công! Dữ liệu nhận được:\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`💰 Giá ADA/USD:     ${price.toFixed(6)} USD`);
        console.log(`📊 Confidence:      ±${confidence.toFixed(6)} USD`);
        console.log(`⏰ Thời gian:       ${timestamp.toISOString()}`);
        console.log(`🔢 Raw Price:       ${priceInfo.price}`);
        console.log(`🔢 Exponent:        ${priceInfo.expo}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        console.log('📈 EMA Price (Exponential Moving Average):');
        const emaPrice = parseFloat(priceData.ema_price.price) * Math.pow(10, priceData.ema_price.expo);
        console.log(`   ${emaPrice.toFixed(6)} USD\n`);
        
        console.log('✨ Dữ liệu JSON đầy đủ:');
        console.log(JSON.stringify(priceData, null, 2));
      } else {
        console.log('❌ Không có dữ liệu giá');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Lỗi từ API:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ Lỗi kết nối:');
    console.log(error.message);
  }
}

// Test các token khác
async function testOtherTokens() {
  console.log('\n\n🔍 Test các token khác...\n');
  
  const tokens = [
    { name: 'Bitcoin (BTC/USD)', id: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43' },
    { name: 'Ethereum (ETH/USD)', id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' },
    { name: 'Solana (SOL/USD)', id: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d' }
  ];
  
  for (const token of tokens) {
    try {
      const response = await fetch(
        `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${token.id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const priceInfo = data[0].price;
          const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
          console.log(`✅ ${token.name}: $${price.toFixed(2)}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${token.name}: Lỗi`);
    }
  }
}

// Chạy test
testPythAPI().then(() => {
  testOtherTokens();
});
