import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reseta o scroll ao topo sempre que a rota muda.
 * Sem isso, navegar de uma rota com scroll alto (ex: landing rolada para
 * o bloco de oferta) para outra (ex: /checkout) mantém a posição vertical
 * — o usuário "cai" no meio da nova página em vez do header.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 'instant' é o que o usuário espera ao trocar de página (sem animação).
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
