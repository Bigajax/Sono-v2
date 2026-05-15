const MARKETING_STORAGE_KEY = 'sono_mkt_ctx';

function getStoredUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const cached = sessionStorage.getItem(MARKETING_STORAGE_KEY);
    if (!cached) return {};
    const parsed = JSON.parse(cached) as { utm?: Record<string, string> };
    const utm = parsed?.utm ?? {};
    const out: Record<string, string> = {};
    for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
      const value = utm[key];
      if (value) out[`utm_${key}`] = value;
    }
    return out;
  } catch {
    return {};
  }
}

export function useGuestAccess() {
  const openGuest = () => {
    const baseUrl =
      (import.meta.env.VITE_APP_URL as string | undefined) || 'http://localhost:5173';

    const params = new URLSearchParams({
      guestSono: '1',
      source: 'landing_sono',
      ...getStoredUtm(),
    });

    // Rota canônica do funnel guest. A rota legacy /app/meditacoes/sono
    // é um <Navigate replace> que descarta query params, perdendo source/utm.
    window.location.href = `${baseUrl}/sono/experiencia?${params.toString()}`;
  };

  return { openGuest };
}
