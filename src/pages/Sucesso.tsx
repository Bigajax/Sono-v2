import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { trackPixel } from '../lib/tracking';

const PRODUCT_KEY = 'protocolo_sono_7_noites';
const PRODUCT_PRICE = 147;
const PURCHASE_FIRED_PREFIX = 'sono_purchase_fired:';

function Sucesso() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const paymentId = params.get('payment_id') || params.get('collection_id') || '';
  const externalReference = params.get('external_reference') || '';

  const isPending = status === 'pending' || status === 'in_process';
  const isFailure = status === 'failure' || status === 'rejected' || status === 'cancelled';

  // Redireciona para /sono/obrigado no app principal. Essa página persiste
  // os params em sessionStorage, manda pro login/register se preciso, e
  // dispara POST /api/entitlements/claim após o user logar — liberando o
  // acesso ao Protocolo Sono Profundo.
  const registerUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (paymentId) p.set('payment_id', paymentId);
    if (externalReference) p.set('external_reference', externalReference);
    p.set('status', isPending ? 'pending' : 'approved');
    return `https://ecofrontend888.vercel.app/sono/obrigado?${p.toString()}`;
  }, [paymentId, externalReference, isPending]);

  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    document.title = isFailure
      ? 'Pagamento não concluído'
      : isPending
        ? 'Pagamento em análise'
        : 'Pagamento confirmado · Protocolo Sono Profundo';
  }, [isFailure, isPending]);

  // Dispara Purchase no Meta Pixel — só para pagamentos aprovados, com dedupe.
  useEffect(() => {
    if (isFailure || isPending) return;

    // Dedupe por payment_id quando disponível; senão por timestamp de 1h.
    const dedupeKey = paymentId
      ? `${PURCHASE_FIRED_PREFIX}${paymentId}`
      : `${PURCHASE_FIRED_PREFIX}any`;

    try {
      const fired = sessionStorage.getItem(dedupeKey);
      if (fired) return;
      sessionStorage.setItem(dedupeKey, String(Date.now()));
    } catch {
      /* sessionStorage indisponível: segue e dispara */
    }

    trackPixel('Purchase', {
      content_name: 'Protocolo Sono Profundo — 7 noites',
      content_ids: [PRODUCT_KEY],
      content_type: 'product',
      value: PRODUCT_PRICE,
      currency: 'BRL',
    });
  }, [isFailure, isPending, paymentId]);

  // ── Failure ─────────────────────────────────────────────────────────────
  if (isFailure) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#0C0D1A' }}
      >
        <div className="max-w-md text-center">
          <p
            style={{
              color: 'rgba(196,145,60,0.8)',
              fontSize: '11px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Pagamento não concluído
          </p>
          <h1
            className="font-serif font-light leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(28px, 6vw, 40px)', color: '#FDFBFF' }}
          >
            Não foi possível confirmar o pagamento.
          </h1>
          <p
            className="mb-10"
            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}
          >
            Sem cobrança no seu cartão. Você pode tentar novamente quando quiser.
          </p>
          <a
            href="/checkout"
            className="inline-block px-8 py-4 rounded-full text-white font-medium tracking-wide transition-all hover:-translate-y-0.5"
            style={{
              fontSize: '14px',
              background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
            }}
          >
            Tentar novamente
          </a>
          {retryError && (
            <p className="mt-5 text-[13px] text-red-300">{retryError}</p>
          )}
        </div>
      </main>
    );
  }

  // ── Pending ─────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#0C0D1A' }}
      >
        <div className="max-w-md text-center">
          <p
            style={{
              color: 'rgba(196,145,60,0.8)',
              fontSize: '11px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Pagamento em análise
          </p>
          <h1
            className="font-serif font-light leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(28px, 6vw, 40px)', color: '#FDFBFF' }}
          >
            Estamos confirmando seu pagamento.
          </h1>
          <p
            className="mb-10"
            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}
          >
            Pix e boleto podem levar alguns minutos. Você vai receber a confirmação no email
            cadastrado e o acesso é liberado em seguida no app.
          </p>
          <a
            href={registerUrl}
            className="inline-block px-8 py-4 rounded-full text-white font-medium tracking-wide transition-all hover:-translate-y-0.5"
            style={{
              fontSize: '14px',
              background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
            }}
          >
            Ir adiantando o cadastro
          </a>
        </div>
      </main>
    );
  }

  // ── Approved ─────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: '#0C0D1A' }}
    >
      <div className="max-w-md text-center relative">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            background:
              'radial-gradient(ellipse at center, rgba(107,79,187,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <p
            style={{
              color: 'rgba(196,145,60,0.8)',
              fontSize: '11px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Pagamento confirmado
          </p>
          <h1
            className="font-serif font-light leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(30px, 6.5vw, 44px)', color: '#FDFBFF' }}
          >
            Bem-vindo ao{' '}
            <em className="italic" style={{ color: '#9D97CC' }}>
              Protocolo Sono Profundo
            </em>
            .
          </h1>
          <p
            className="mb-10"
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.75,
            }}
          >
            Falta um passo:{' '}
            <strong style={{ color: '#FDFBFF', fontWeight: 500 }}>
              criar sua conta no app
            </strong>{' '}
            usando o mesmo email do pagamento. É assim que liberamos seu acesso vitalício
            às 7 noites.
          </p>

          <a
            href={registerUrl}
            onClick={() => setRetryError(null)}
            className="inline-flex w-full max-w-[360px] items-center justify-center gap-2 px-8 py-[18px] rounded-full text-white font-bold tracking-[-0.005em] transition-all hover:-translate-y-0.5"
            style={{
              fontSize: '15.5px',
              background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
              boxShadow: '0 12px 32px rgba(107,79,187,0.35)',
            }}
          >
            Criar conta e abrir o app
            <ArrowRight className="h-[16px] w-[16px]" strokeWidth={2.25} />
          </a>

          <p
            className="mt-4"
            style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}
          >
            Use o mesmo email do pagamento para liberar o acesso automaticamente.
          </p>

          <div
            className="mt-10 flex flex-col gap-3 rounded-2xl px-5 py-5 text-left"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start gap-3">
              <KeyRound
                className="mt-[3px] h-[16px] w-[16px] shrink-0"
                strokeWidth={2}
                style={{ color: 'rgba(196,145,60,0.85)' }}
              />
              <p
                className="text-[13px] leading-[1.55]"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                Use o mesmo email do pagamento ao cadastrar — o acesso aparece sozinho.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-[3px] h-[16px] w-[16px] shrink-0"
                strokeWidth={2}
                style={{ color: 'rgba(196,145,60,0.85)' }}
              />
              <p
                className="text-[13px] leading-[1.55]"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <span className="font-semibold" style={{ color: '#FDFBFF' }}>
                  7 dias de garantia.
                </span>{' '}
                Se não funcionar, devolvemos 100%. Escreva para o suporte.
              </p>
            </div>
          </div>

          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.32)',
              lineHeight: 1.7,
              marginTop: '24px',
            }}
          >
            Dúvidas?{' '}
            <a
              href="mailto:ecotopia.app777@gmail.com"
              style={{ color: 'rgba(196,145,60,0.9)' }}
            >
              ecotopia.app777@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Sucesso;
