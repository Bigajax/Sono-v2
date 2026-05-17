// Aquece o backend Render (que dorme após ~15min) antes que o usuário clique
// no checkout. Idempotente: dispara no máximo 1 vez por sessão e silencia erros.

// Render free tier dorme após 15min; mantemos TTL menor para re-aquecer em tempo
const WARMUP_TTL_MS = 10 * 60 * 1000;

let warmupPromise: Promise<void> | null = null;
let warmupAt = 0;

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const isLocalDev =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalDev
    ? (import.meta.env.VITE_API_URL ?? '')
    : (import.meta.env.VITE_API_URL || 'https://ecobackend888.onrender.com');
}

export function warmupBackend(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const now = Date.now();
  if (warmupPromise && now - warmupAt < WARMUP_TTL_MS) return warmupPromise;

  const apiUrl = getApiBaseUrl();
  // Em dev com proxy vazio não faz sentido aquecer
  if (!apiUrl) return Promise.resolve();

  warmupAt = now;
  warmupPromise = fetch(`${apiUrl}/health`, {
    method: 'GET',
    cache: 'no-store',
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);

  return warmupPromise;
}
