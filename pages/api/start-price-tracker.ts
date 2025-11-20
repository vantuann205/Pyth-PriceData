import type { NextApiRequest, NextApiResponse } from "next";
import { addPriceToHistory } from "./price-history";

let isTracking = false;
let trackingInterval: NodeJS.Timeout | null = null;

// Hàm fetch giá và lưu vào lịch sử
const fetchAndStorePrice = async () => {
  try {
    const ADA_USD_PRICE_FEED_ID =
      "0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d";

    const pythResponse = await fetch(
      `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${ADA_USD_PRICE_FEED_ID}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (pythResponse.ok) {
      const data = await pythResponse.json();
      
      if (data && data.length > 0) {
        const priceData = data[0];
        const priceInfo = priceData.price;
        const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
        const finalPrice = parseFloat(price.toFixed(6));
        
        // Lưu vào lịch sử
        addPriceToHistory(finalPrice, "Pyth Network");
        
        console.log(`[Price Tracker] Stored price: $${finalPrice}`);
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
    if (isTracking) {
      return res.status(200).json({
        success: true,
        message: "Price tracker is already running"
      });
    }
    
    // Bắt đầu tracking
    isTracking = true;
    
    // Fetch ngay lập tức
    await fetchAndStorePrice();
    
    // Sau đó fetch mỗi giây
    trackingInterval = setInterval(fetchAndStorePrice, 1000);
    
    return res.status(200).json({
      success: true,
      message: "Price tracker started"
    });
  }
  
  if (req.method === 'DELETE') {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
    isTracking = false;
    
    return res.status(200).json({
      success: true,
      message: "Price tracker stopped"
    });
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      isTracking
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
