declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type StandardEvent =
  | 'Lead'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'CompleteRegistration'
  | 'ViewContent';

/**
 * Dispara um evento standard do Meta Pixel.
 * Fire-and-forget: nunca quebra a UX se o Pixel não estiver carregado ou bloqueado.
 *
 * O Pixel é inicializado em index.html antes desse código rodar.
 */
export function trackPixel(event: StandardEvent, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    window.fbq?.('track', event, params);
  } catch {
    /* fire-and-forget */
  }
}
