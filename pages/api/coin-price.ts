import type { NextApiRequest, NextApiResponse } from "next";
import { priceStore } from "../../lib/priceStore";
import { getCoinById } from "../../lib/coins";

type Data = {
  price: number;
  source: string;
  timestamp: string;
  confidence?: number;
  coinId?: string;
  symbol?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const { coinId } = req.query;
    
    if (!coinId || typeof coinId !== 'string') {
      return res.status(400).json({
        price: 0,
        source: "Error",
        timestamp: new Date().toISOString(),
        error: "coinId is required"
      });
    }
    
    const coin = getCoinById(coinId);
    
    if (!coin) {
      return res.status(404).json({
        price: 0,
        source: "Error",
        timestamp: new Date().toISOString(),
        error: `Coin ${coinId} not found`
      });
    }

    const pythResponse = await fetch(
      `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${coin.priceFeedId}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!pythResponse.ok) {
      const errorText = await pythResponse.text();
      console.error("Pyth API error:", pythResponse.status, errorText);

      return res.status(500).json({
        price: 0,
        source: "Error",
        timestamp: new Date().toISOString(),
        error: `Pyth API error: ${pythResponse.status}`,
      });
    }

    const data = await pythResponse.json();

    if (!data || data.length === 0) {
      return res.status(500).json({
        price: 0,
        source: "Error",
        timestamp: new Date().toISOString(),
        error: "No price data available from Pyth",
      });
    }

    const priceData = data[0];
    const priceInfo = priceData.price;

    const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
    const confidence =
      parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo);

    const timestamp = new Date(priceInfo.publish_time * 1000).toISOString();

    const finalPrice = parseFloat(price.toFixed(6));
    
    // Lưu vào lịch sử
    priceStore.addPrice(coin.id, finalPrice, "Pyth Network");

    return res.status(200).json({
      price: finalPrice,
      source: "Pyth Network",
      timestamp: timestamp,
      confidence: parseFloat(confidence.toFixed(6)),
      coinId: coin.id,
      symbol: coin.symbol
    });
  } catch (error) {
    console.error("Error fetching coin price:", error);
    return res.status(500).json({
      price: 0,
      source: "Error",
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error ? error.message : "Failed to fetch coin price",
    });
  }
}
