import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackPixel } from '../lib/tracking';
import { warmupBackend } from '../lib/warmup';

const PRODUCT_KEY = 'protocolo_sono_7_noites';
const PRODUCT_PRICE = 147;

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openCheckout = () => {
    if (loading) return;
    setLoading(true);

    trackPixel('InitiateCheckout', {
      content_name: 'Protocolo Sono Profundo — 7 noites',
      content_ids: [PRODUCT_KEY],
      content_type: 'product',
      value: PRODUCT_PRICE,
      currency: 'BRL',
    });

    navigate('/checkout');
  };

  const prewarm = () => {
    void warmupBackend();
  };

  return { loading, openCheckout, prewarm };
}
