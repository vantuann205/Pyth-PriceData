import type { NextApiRequest, NextApiResponse } from "next";
import { TOP_COINS } from "../../lib/coins";

interface PriceData {
  coinId: string;
  symbol: string;
  name: string;
  price: number;
  timestamp: string;
  confidence?: number;
}

type Data = {
  success: boolean;
  data?: PriceData[];
  error?: string;
};

// In-memory cache để tránh fetch quá nhiều
interface CacheEntry {
  data: PriceData[];
  timestamp: number;
}

let apiCache: CacheEntry | null = null;
const CACHE_TTL = 500; // Cache 500ms để tránh spam requests

// Helper function để fetch song song
async function fetchCoinPrice(coin: typeof TOP_COINS[0]): Promise<PriceData | null> {
  try {
    const singleUrl = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${coin.priceFeedId}`;
    const singleResponse = await fetch(singleUrl, {
      headers: { Accept: "application/json" },
    });
    
    if (singleResponse.ok) {
      const singleData = await singleResponse.json();
      if (singleData && singleData.length > 0) {
        const priceData = singleData[0];
        const priceInfo = priceData.price;
        const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
        const confidence = parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo);
        const timestamp = new Date(priceInfo.publish_time * 1000).toISOString();
        
        return {
          coinId: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: parseFloat(price.toFixed(6)),
          timestamp: timestamp,
          confidence: parseFloat(confidence.toFixed(6))
        };
      }
    }
  } catch (e) {
    console.warn(`[all-prices] Failed to fetch ${coin.symbol}:`, e);
  }
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Kiểm tra cache trước
    const now = Date.now();
    if (apiCache && (now - apiCache.timestamp) < CACHE_TTL) {
      return res.status(200).json({
        success: true,
        data: apiCache.data
      });
    }

    // Build URL với tất cả price feed IDs
    const url = new URL('https://hermes.pyth.network/api/latest_price_feeds');
    TOP_COINS.forEach(coin => {
      url.searchParams.append('ids[]', coin.priceFeedId);
    });
    
    const pythResponse = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      // Thêm cache headers để tối ưu
      next: { revalidate: 0 }
    });

    if (!pythResponse.ok) {
      const errorText = await pythResponse.text();
      console.error("[all-prices] Pyth API error:", pythResponse.status, errorText);
      
      // Nếu lỗi 404, có thể một số ID không hợp lệ
      // Fetch song song tất cả coins để tối ưu tốc độ
      if (pythResponse.status === 404) {
        console.warn("[all-prices] Some price feeds not found, trying parallel requests...");
        
        // Fetch song song tất cả coins cùng lúc
        const pricePromises = TOP_COINS.map(coin => fetchCoinPrice(coin));
        const results = await Promise.all(pricePromises);
        
        // Lọc bỏ null values
        const prices = results.filter((p): p is PriceData => p !== null);
        
        if (prices.length > 0) {
          // Cache kết quả
          apiCache = {
            data: prices,
            timestamp: Date.now()
          };
          
          return res.status(200).json({
            success: true,
            data: prices
          });
        }
      }
      
      return res.status(500).json({
        success: false,
        error: `Pyth API error: ${pythResponse.status} - ${errorText}`,
      });
    }

    let data;
    try {
      data = await pythResponse.json();
    } catch (e) {
      console.error('[all-prices] Failed to parse JSON response');
      return res.status(500).json({
        success: false,
        error: "Invalid response from Pyth API",
      });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('[all-prices] No data received from Pyth API');
      return res.status(500).json({
        success: false,
        error: "No price data available from Pyth",
      });
    }

    console.log(`[all-prices] Received ${data.length} price feeds from Pyth`);

    // Xử lý dữ liệu từ Pyth
    const prices: PriceData[] = [];
    
    for (const priceData of data) {
      // Pyth API có thể trả về ID với hoặc không có "0x" prefix
      const responseId = priceData.id?.replace(/^0x/i, '').toLowerCase();
      
      // Tìm coin bằng cách so sánh ID (bỏ qua "0x" prefix nếu có)
      const coin = TOP_COINS.find(c => {
        const feedId = c.priceFeedId.replace(/^0x/i, '').toLowerCase();
        return feedId === responseId;
      });
      
      if (coin) {
        const priceInfo = priceData.price;
        const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
        const confidence = parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo);
        const timestamp = new Date(priceInfo.publish_time * 1000).toISOString();
        
        prices.push({
          coinId: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: parseFloat(price.toFixed(6)),
          timestamp: timestamp,
          confidence: parseFloat(confidence.toFixed(6))
        });
        
        console.log(`[all-prices] Found price for ${coin.symbol}: $${price.toFixed(6)}`);
      } else {
        console.warn(`[all-prices] No matching coin found for ID: ${priceData.id}`);
      }
    }

    if (prices.length === 0) {
      console.error('[all-prices] No matching coins found in response');
      return res.status(500).json({
        success: false,
        error: "No matching coins found in Pyth response",
      });
    }

    // Cache kết quả
    apiCache = {
      data: prices,
      timestamp: Date.now()
    };

    return res.status(200).json({
      success: true,
      data: prices
    });
  } catch (error) {
    console.error("Error fetching all prices:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch prices",
    });
  }
}

