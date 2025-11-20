import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
}

export default function Chart() {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [source, setSource] = useState<string>('Pyth Network');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const fetchPrice = async () => {
    try {
      const res = await fetch('/api/ada-price');
      const data = await res.json();
      
      if (data.price) {
        const now = Date.now();
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        
        setCurrentPrice(data.price);
        setSource(data.source);
        setIsConnected(true);
        
        // Thêm vào history (giữ tối đa 120 điểm = 2 phút)
        setPriceHistory(prev => {
          const newHistory = [...prev, {
            time: timeStr,
            price: data.price,
            timestamp: now
          }];
          
          // Giữ tối đa 120 điểm
          if (newHistory.length > 120) {
            return newHistory.slice(-120);
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      setIsConnected(false);
    }
  };

  // Khởi tạo dữ liệu ban đầu từ lịch sử thực
  useEffect(() => {
    const initializeChart = async () => {
      try {
        // 1. Bắt đầu price tracker (nếu chưa chạy)
        await fetch('/api/start-price-tracker', { method: 'POST' });
        
        // 2. Lấy lịch sử giá (50 điểm cuối)
        const historyRes = await fetch('/api/price-history?limit=50');
        const historyData = await historyRes.json();
        
        if (historyData.success && historyData.data.length > 0) {
          // Convert dữ liệu lịch sử sang format PricePoint
          const historicalData: PricePoint[] = historyData.data.map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString('vi-VN'),
            price: item.price,
            timestamp: item.timestamp
          }));
          
          setPriceHistory(historicalData);
          setCurrentPrice(historicalData[historicalData.length - 1].price);
          setSource(historyData.data[0].source);
          setIsInitialized(true);
        } else {
          // Nếu chưa có lịch sử, fetch giá hiện tại và bắt đầu
          const res = await fetch('/api/ada-price');
          const data = await res.json();
          
          if (data.price) {
            setCurrentPrice(data.price);
            setSource(data.source);
            setIsInitialized(true);
          }
        }
        
        // 3. Bắt đầu update real-time
        const interval = setInterval(fetchPrice, 1000);
        return () => clearInterval(interval);
        
      } catch (error) {
        console.error('Error initializing chart:', error);
        setIsConnected(false);
      }
    };
    
    initializeChart();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setCountdown(1);
  }, [currentPrice]);

  // Tính min/max cho scale với padding để tránh zoom quá
  const prices = priceHistory.map(p => p.price);
  const dataMin = Math.min(...prices);
  const dataMax = Math.max(...prices);
  const dataRange = dataMax - dataMin;
  
  // Thêm padding 20% cho min/max để chart không bị zoom quá
  // Minimum range là 0.001 (0.1%) để tránh chart quá phẳng
  const paddingPercent = 0.2; // 20% padding
  const minRange = 0.001; // Minimum range 0.1%
  
  const actualRange = Math.max(dataRange, minRange);
  const padding = actualRange * paddingPercent;
  
  const minPrice = dataMin - padding;
  const maxPrice = dataMax + padding;
  const priceRange = maxPrice - minPrice;

  // Tính toán điểm cho SVG path
  const getPath = () => {
    if (priceHistory.length < 2) return '';
    
    const width = 800;
    const height = 300;
    const padding = 20;
    
    const points = priceHistory.map((point, index) => {
      const x = padding + (index / (priceHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      <Head>
        <title>ADA Price Chart | Real-time</title>
        <meta name="description" content="Real-time ADA price chart" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-300">
              ADA/USD Live Chart
            </h1>
            <p className="text-gray-400 mt-2">Real-time price updates every second</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            ← Back to Price
          </Link>
        </div>

        {/* Current Price Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-white mb-2">
                ${currentPrice?.toFixed(6) || '0.000000'}
              </div>
              <div className="text-gray-400">
                {source} • {priceHistory.length} data points
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 ${
              isConnected 
                ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">Price Movement (Last 2 minutes)</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div>Min: ${dataMin.toFixed(6)}</div>
              <div>Max: ${dataMax.toFixed(6)}</div>
              <div>Range: ${dataRange.toFixed(6)}</div>
              <div className="text-purple-400">• Optimized view</div>
            </div>
          </div>

          {priceHistory.length < 2 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="mb-2">Initializing chart...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <svg 
                viewBox="0 0 800 300" 
                className="w-full h-auto"
                style={{ maxHeight: '300px' }}
              >
                {/* Grid lines */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines with price labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const yPos = 20 + (i * 260 / 4);
                  const priceAtLine = maxPrice - (i / 4) * priceRange;
                  return (
                    <g key={i}>
                      <line
                        x1="20"
                        y1={yPos}
                        x2="780"
                        y2={yPos}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                      />
                      <text
                        x="10"
                        y={yPos + 4}
                        fill="#9CA3AF"
                        fontSize="10"
                        textAnchor="end"
                      >
                        ${priceAtLine.toFixed(4)}
                      </text>
                    </g>
                  );
                })}

                {/* Area under the line */}
                <path
                  d={`${getPath()} L 780,280 L 20,280 Z`}
                  fill="url(#gradient)"
                />

                {/* Price line */}
                <path
                  d={getPath()}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Current price dot */}
                {priceHistory.length > 0 && (
                  <circle
                    cx={20 + ((priceHistory.length - 1) / (priceHistory.length - 1)) * 760}
                    cy={280 - ((priceHistory[priceHistory.length - 1].price - minPrice) / priceRange) * 260}
                    r="6"
                    fill="#8b5cf6"
                    className="animate-pulse"
                  />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Data Points</div>
            <div className="text-2xl font-bold text-white">{priceHistory.length}</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Update Frequency</div>
            <div className="text-2xl font-bold text-white">1 second</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Source</div>
            <div className="text-2xl font-bold text-purple-300">{source}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
