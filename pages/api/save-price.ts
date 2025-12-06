import type { NextApiRequest, NextApiResponse } from "next";
import { priceStore } from "../../lib/priceStore";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { coinId, price, source } = req.body;
    
    if (!coinId || price === undefined || price === null) {
      console.error('[save-price] Missing data:', { coinId, price, body: req.body });
      return res.status(400).json({ error: 'coinId and price are required', received: req.body });
    }
    
    priceStore.addPrice(coinId, price, source || 'Pyth Network');
    console.log(`[save-price] Saved ${coinId}: $${price}`);
    
    return res.status(200).json({
      success: true,
      message: 'Price saved'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
