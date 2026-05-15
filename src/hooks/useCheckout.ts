import { useState } from 'react';
import { trackPixel } from '../lib/tracking';

const PRODUCT_KEY = 'protocolo_sono_7_noites';
const PRODUCT_PRICE = 147;

function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Em produção sempre bate no backend Render. Em dev local (npm run dev no host),
      // VITE_API_URL='' usa o proxy do Vite. Hostname localhost = dev → proxy.
      const isLocalDev =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const apiUrl = isLocalDev
        ? (import.meta.env.VITE_API_URL ?? '')
        : (import.meta.env.VITE_API_URL || 'https://ecobackend888.onrender.com');

      const utm = getUtmParams();

      const res = await fetch(`${apiUrl}/api/mp/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productKey: PRODUCT_KEY, origin: 'landing', utm }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erro ${res.status}`);
      }

      const { init_point } = await res.json();

      if (!init_point) throw new Error('Link de pagamento não retornado');

      trackPixel('InitiateCheckout', {
        content_name: 'Protocolo Sono Profundo — 7 noites',
        content_ids: [PRODUCT_KEY],
        content_type: 'product',
        value: PRODUCT_PRICE,
        currency: 'BRL',
      });

      window.location.href = init_point;
      // Não setar loading(false) — browser vai navegar
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Erro ao abrir o pagamento';
      alert(`Não foi possível abrir o pagamento. ${message}\n\nTente novamente ou entre em contato.`);
    }
  };

  return { loading, openCheckout };
}
