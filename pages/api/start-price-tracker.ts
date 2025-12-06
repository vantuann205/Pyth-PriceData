import type { NextApiRequest, NextApiResponse } from "next";
import { priceStore } from "../../lib/priceStore";
import { TOP_COINS } from "../../lib/coins";

// Hàm fetch giá tất cả coins và lưu vào lịch sử
const fetchAndStorePrices = async () => {
  try {
    // Tạo query string với tất cả price feed IDs
    const priceFeeds = TOP_COINS.map(coin => `ids[]=${coin.priceFeedId}`).join('&');
    
    const pythResponse = await fetch(
      `https://hermes.pyth.network/api/latest_price_feeds?${priceFeeds}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (pythResponse.ok) {
      const data = await pythResponse.json();
      
      if (data && data.length > 0) {
        // Xử lý từng coin
        data.forEach((priceData: any) => {
          const priceFeedId = priceData.id;
          
          // Tìm coin tương ứng
          const coin = TOP_COINS.find(c => c.priceFeedId === priceFeedId);
          
          if (coin) {
            const priceInfo = priceData.price;
            const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
            const finalPrice = parseFloat(price.toFixed(6));
            
            // Lưu vào lịch sử với coinId
            priceStore.addPrice(coin.id, finalPrice, "Pyth Network");
            
            console.log(`[Price Tracker] ${coin.symbol}: $${finalPrice}`);
          }
        });
      }
    }
  } catch (error) {
    console.error("[Price Tracker] Error:", error);
  }
};

// API endpoint để bắt đầu tracking
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    if (priceStore.getTracking()) {
      return res.status(200).json({
        success: true,
        message: "Price tracker is already running"
      });
    }
    
    // Bắt đầu tracking
    priceStore.setTracking(true);
    
    // Fetch ngay lập tức
    await fetchAndStorePrices();
    
    // Sau đó fetch mỗi giây
    const interval = setInterval(fetchAndStorePrices, 1000);
    priceStore.setInterval(interval);
    
    console.log("[Price Tracker] Started tracking all coins");
    
    return res.status(200).json({
      success: true,
      message: "Price tracker started for all coins"
    });
  }
  
  if (req.method === 'DELETE') {
    priceStore.clearInterval();
    priceStore.setTracking(false);
    
    console.log("[Price Tracker] Stopped tracking");
    
    return res.status(200).json({
      success: true,
      message: "Price tracker stopped"
    });
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      isTracking: priceStore.getTracking()
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
