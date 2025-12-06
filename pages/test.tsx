import { useState, useEffect } from 'react';

export default function Test() {
  const [status, setStatus] = useState('Starting...');
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('Fetching from Pyth...');
        
        // Fetch BTC price
        const res = await fetch(
          'https://hermes.pyth.network/api/latest_price_feeds?ids[]=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'
        );
        
        const data = await res.json();
        
        if (data && data.length > 0) {
          const priceData = data[0];
          const priceInfo = priceData.price;
          const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
          const finalPrice = parseFloat(price.toFixed(6));
          
          setStatus(`Got BTC price: $${finalPrice}`);
          
          // Save to backend
          const saveRes = await fetch('/api/save-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coinId: 'bitcoin',
              price: finalPrice,
              source: 'Test Page'
            })
          });
          
          const saveData = await saveRes.json();
          setStatus(`Saved: ${JSON.stringify(saveData)}`);
          
          // Get history
          const historyRes = await fetch('/api/price-history?coinId=bitcoin&limit=10');
          const historyData = await historyRes.json();
          
          setPrices(historyData.data || []);
          setStatus(`History loaded: ${historyData.count} points`);
        }
      } catch (error: any) {
        setStatus(`Error: ${error.message}`);
      }
    };
    
    test();
    const interval = setInterval(test, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Page</h1>
      <p>Status: {status}</p>
      <h2>Price History:</h2>
      <ul>
        {prices.map((p, i) => (
          <li key={i}>
            ${p.price} at {new Date(p.timestamp).toLocaleTimeString()} from {p.source}
          </li>
        ))}
      </ul>
    </div>
  );
}
