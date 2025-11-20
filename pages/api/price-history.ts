import type { NextApiRequest, NextApiResponse } from "next";

interface PricePoint {
  price: number;
  timestamp: number;
  source: string;
}

// Lưu trữ lịch sử giá trong memory (tối đa 300 điểm = 5 phút)
let priceHistory: PricePoint[] = [];

// Hàm để thêm giá mới vào lịch sử
export const addPriceToHistory = (price: number, source: string) => {
  const now = Date.now();
  
  priceHistory.push({
    price,
    timestamp: now,
    source
  });
  
  // Giữ tối đa 300 điểm (5 phút)
  if (priceHistory.length > 300) {
    priceHistory = priceHistory.slice(-300);
  }
};

// API endpoint để lấy lịch sử giá
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    
    // Lấy N điểm cuối cùng
    const recentHistory = priceHistory.slice(-limitNum);
    
    return res.status(200).json({
      success: true,
      count: recentHistory.length,
      data: recentHistory
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
