import { useState } from 'react';
import { trackPixel } from '../lib/tracking';
import { getApiBaseUrl, warmupBackend } from '../lib/warmup';

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
      const apiUrl = getApiBaseUrl();
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

  // Para usar em onMouseEnter/onFocus dos botões — acorda o backend antes do clique
  const prewarm = () => {
    void warmupBackend();
  };

  return { loading, openCheckout, prewarm };
}
