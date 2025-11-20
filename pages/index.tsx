import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [source, setSource] = useState<string>('Loading...');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'same'>('same');
  const [countdown, setCountdown] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const fetchPrice = async () => {
    try {
      const res = await fetch('/api/ada-price');
      const data = await res.json();
      
      if (data.price) {
        setPreviousPrice(price);
        setPrice(data.price);
        setSource(data.source);
        setConfidence(data.confidence);
        setLastUpdated(new Date(data.timestamp).toLocaleTimeString('vi-VN'));
        setIsConnected(true);
        
        // Xác định giá tăng hay giảm
        if (price !== null) {
          if (data.price > price) {
            setPriceChange('up');
          } else if (data.price < price) {
            setPriceChange('down');
          } else {
            setPriceChange('same');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch giá lần đầu và setup interval
  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 1000); // Cập nhật mỗi 1 giây
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset countdown khi fetch price
  useEffect(() => {
    setCountdown(1);
  }, [price]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4 font-sans text-white">
      <Head>
        <title>ADA Price Real-time | Pyth Network</title>
        <meta name="description" content="Real-time ADA price from Pyth Network Oracle" />
      </Head>

      <div className="relative group">
        {/* Animated glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r rounded-2xl blur opacity-30 transition-all duration-500 ${
          priceChange === 'up' ? 'from-green-600 to-emerald-600' :
          priceChange === 'down' ? 'from-red-600 to-rose-600' :
          'from-purple-600 to-blue-600'
        }`}></div>

        <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl ring-1 ring-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-300">
                  ADA/USD
                </h1>
                <p className="text-sm text-gray-400 mt-1">Cardano</p>
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

          {/* Price Display */}
          <div className="text-center py-8 relative">
            {loading && !price ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-20 w-64 bg-gray-700/50 rounded-lg mb-4"></div>
                <div className="h-4 w-32 bg-gray-700/50 rounded mb-2"></div>
              </div>
            ) : (
              <>
                <div className={`text-7xl font-extrabold tracking-tight mb-2 drop-shadow-2xl transition-all duration-300 ${
                  priceChange === 'up' ? 'text-green-400 scale-105' :
                  priceChange === 'down' ? 'text-red-400 scale-105' :
                  'text-white'
                }`}>
                  ${price?.toFixed(6)}
                </div>
                
                {/* Price Change Indicator */}
                {previousPrice !== null && price !== null && previousPrice !== price && (
                  <div className={`inline-flex items-center space-x-1 text-sm font-bold ${
                    priceChange === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {priceChange === 'up' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{Math.abs(((price - previousPrice) / previousPrice) * 100).toFixed(3)}%</span>
                  </div>
                )}

                <p className="text-gray-400 text-sm font-medium tracking-wide uppercase mt-2">
                  United States Dollar
                </p>

                {/* Confidence */}
                {confidence && (
                  <div className="mt-3 text-xs text-gray-500">
                    Confidence: ±${confidence.toFixed(6)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info Grid */}
          <div className="mt-8 pt-6 border-t border-gray-700/50 grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Source</span>
              <span className="font-bold text-purple-300 text-sm">{source}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Update</span>
              <span className="font-bold text-gray-300 text-sm">{lastUpdated || '--:--:--'}</span>
            </div>
          </div>

          {/* Chart Button */}
          <Link
            href="/chart"
            className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Live Chart</span>
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
          Powered by Pyth Network • Updates every second
        </div>
      </div>
    </div>
  );
}
