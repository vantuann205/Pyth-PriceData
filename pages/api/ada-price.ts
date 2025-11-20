import type { NextApiRequest, NextApiResponse } from "next";
import { addPriceToHistory } from "./price-history";

type Data = {
  price: number;
  source: string;
  timestamp: string;
  confidence?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    // Pyth Network API - Không cần API key, hoàn toàn miễn phí
    // ADA/USD Price Feed ID từ Pyth Network
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

    // Pyth trả về giá với expo (exponent)
    // Ví dụ: price = 46515737, expo = -8 => giá thực = 0.46515737 USD
    const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
    const confidence =
      parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo);

    // publish_time là Unix timestamp (seconds)
    const timestamp = new Date(priceInfo.publish_time * 1000).toISOString();

    const finalPrice = parseFloat(price.toFixed(6));
    
    // Lưu vào lịch sử
    addPriceToHistory(finalPrice, "Pyth Network");

    return res.status(200).json({
      price: finalPrice,
      source: "Pyth Network",
      timestamp: timestamp,
      confidence: parseFloat(confidence.toFixed(6)),
    });
  } catch (error) {
    console.error("Error fetching ADA price:", error);
    return res.status(500).json({
      price: 0,
      source: "Error",
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error ? error.message : "Failed to fetch ADA price",
    });
  }
}
