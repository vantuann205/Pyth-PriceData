import type { NextApiRequest, NextApiResponse } from "next";
import { priceStore } from "../../lib/priceStore";

// API endpoint để lấy lịch sử giá
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { coinId, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    
    if (!coinId || typeof coinId !== 'string') {
      return res.status(400).json({ error: 'coinId is required' });
    }
    
    // Lấy lịch sử của coin
    const recentHistory = priceStore.getHistory(coinId, limitNum);
    
    return res.status(200).json({
      success: true,
      coinId,
      count: recentHistory.length,
      data: recentHistory
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
