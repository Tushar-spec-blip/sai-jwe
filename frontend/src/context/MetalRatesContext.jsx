import { createContext, useContext, useState } from 'react';
import storageService from '../services/storageService';

const MetalRatesContext = createContext(null);

export function MetalRatesProvider({ children }) {
  const [rates, setRates] = useState(() => storageService.getMetalRates());

  const updateRate = (id, newRate) => {
    setRates(prev => {
      const updated = prev.map(r => r.id === id ? {
        ...r,
        rate_per_gram: parseFloat(newRate) || r.rate_per_gram,
        updated_at: new Date().toISOString().split('T')[0],
      } : r);
      storageService.saveMetalRates(updated);
      return updated;
    });
  };

  const getRateFor = (metal, purity) => {
    const found = rates.find(r => r.metal.toLowerCase() === (metal || '').toLowerCase() && r.purity === purity);
    if (found) return found.rate_per_gram;
    const fallback = rates.find(r => r.metal.toLowerCase() === (metal || '').toLowerCase());
    return fallback ? fallback.rate_per_gram : (metal?.toLowerCase() === 'silver' ? 85 : 6500);
  };

  return (
    <MetalRatesContext.Provider value={{ rates, updateRate, getRateFor }}>
      {children}
    </MetalRatesContext.Provider>
  );
}

export function useMetalRates() {
  const ctx = useContext(MetalRatesContext);
  if (!ctx) throw new Error('useMetalRates must be used inside MetalRatesProvider');
  return ctx;
}
