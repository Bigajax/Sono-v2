import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { getApiBaseUrl } from '../lib/warmup';

const PRODUCT_PRICE = 147;
const PIX_EXPIRATION_MIN = 15;
const POLL_INTERVAL_MS = 5000;

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;

let mpInitialized = false;
function ensureMpInit() {
  if (!mpInitialized && MP_PUBLIC_KEY) {
    initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
    mpInitialized = true;
  }
}

type Method = 'pix' | 'card' | null;

type PixResponse = {
  id: number | string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  expiration_date: string;
  external_reference?: string;
};

type CardResponse = {
  id: number | string;
  status: string;
  status_detail: string;
  external_reference?: string;
};

type StatusResponse = {
  id: number | string;
  status: string;
  status_detail: string;
};

// ---------- helpers ----------
function maskCpf(v: string): string {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function friendlyError(detail: string | undefined, fallback: string): string {
  if (!detail) return fallback;
  const map: Record<string, string> = {
    cc_rejected_insufficient_amount: 'Cartão sem saldo suficiente.',
    cc_rejected_bad_filled_card_number: 'Número do cartão inválido. Confira os dados.',
    cc_rejected_bad_filled_date: 'Data de validade inválida.',
    cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) inválido.',
    cc_rejected_bad_filled_other: 'Confira os dados do cartão.',
    cc_rejected_high_risk: 'Pagamento recusado por análise de risco. Tente outro cartão ou use Pix.',
    cc_rejected_call_for_authorize: 'Você precisa autorizar a compra com seu banco antes de tentar de novo.',
    cc_rejected_card_disabled: 'Cartão desativado. Tente outro cartão ou use Pix.',
    cc_rejected_duplicated_payment: 'Pagamento duplicado detectado. Aguarde alguns minutos.',
    cc_rejected_max_attempts: 'Muitas tentativas. Tente outro cartão ou use Pix.',
  };
  return map[detail] ?? fallback;
}

// ============================================================
// Header — visível em todas as etapas
// ============================================================
function Header() {
  return (
    <header className="pt-10 md:pt-14 pb-6 text-center px-6">
      <div className="flex items-center gap-3 justify-center mb-4">
        <div className="h-px w-6" style={{ background: 'rgba(157,151,204,0.25)' }} />
        <p style={{ color: 'rgba(157,151,204,0.5)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase' }}>
          Checkout seguro
        </p>
        <div className="h-px w-6" style={{ background: 'rgba(157,151,204,0.25)' }} />
      </div>
      <h1 className="font-serif font-light leading-[1.1] mb-3" style={{ fontSize: 'clamp(24px, 5vw, 36px)', color: '#FDFBFF' }}>
        Protocolo Sono Profundo
        <br />
        <em className="italic" style={{ color: '#9D97CC', fontSize: '0.7em' }}>7 noites</em>
      </h1>
      <div className="flex items-center gap-2 justify-center flex-wrap">
        <span style={{ fontSize: '14px', color: '#FDFBFF' }}>
          <span style={{ opacity: 0.5, fontSize: '0.85em' }}>R$</span>
          <strong style={{ fontWeight: 500 }}> 147</strong>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          pagamento único
        </span>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(196,145,60,0.9)',
            border: '1px solid rgba(196,145,60,0.35)',
            padding: '3px 10px',
            borderRadius: '999px',
            letterSpacing: '0.04em',
          }}
        >
          Garantia de 7 dias
        </span>
      </div>
    </header>
  );
}

// ============================================================
// Cards de método de pagamento
// ============================================================
function MethodSelection({ onSelect }: { onSelect: (m: Method) => void }) {
  return (
    <section className="px-6 pb-16 mt-8 max-w-5xl mx-auto" aria-label="Escolher forma de pagamento">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pix card */}
        <button
          type="button"
          onClick={() => onSelect('pix')}
          aria-label="Pagar com Pix — recomendado, aprovação imediata"
          className="text-left rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4913C]"
          style={{
            background: 'linear-gradient(140deg, rgba(196,145,60,0.10) 0%, rgba(196,145,60,0.04) 100%)',
            border: '1px solid rgba(196,145,60,0.35)',
            boxShadow: '0 12px 48px rgba(196,145,60,0.10)',
          }}
        >
          <p style={{ fontSize: '10px', color: 'rgba(196,145,60,0.95)', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '14px' }}>
            Recomendado · Aprovação imediata
          </p>
          <h3 className="font-serif font-light mb-2" style={{ fontSize: '26px', color: '#FDFBFF' }}>
            Pix
          </h3>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: '20px' }}>
            QR Code na próxima tela. Acesso liberado assim que o banco confirmar.
          </p>
          <span style={{ fontSize: '13px', color: 'rgba(196,145,60,0.95)' }}>
            Pagar com Pix →
          </span>
        </button>

        {/* Card */}
        <button
          type="button"
          onClick={() => onSelect('card')}
          aria-label="Pagar com cartão de crédito"
          className="text-left rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B5FD4]"
          style={{
            background: 'rgba(107,79,187,0.06)',
            border: '1px solid rgba(107,79,187,0.30)',
          }}
        >
          <p style={{ fontSize: '10px', color: 'rgba(157,151,204,0.7)', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '14px' }}>
            Cartão de crédito
          </p>
          <h3 className="font-serif font-light mb-2" style={{ fontSize: '26px', color: '#FDFBFF' }}>
            Cartão
          </h3>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: '20px' }}>
            Até 3x sem juros. Visa, Master, Elo, Amex, Hipercard.
          </p>
          <span style={{ fontSize: '13px', color: 'rgba(157,151,204,0.9)' }}>
            Pagar com cartão →
          </span>
        </button>
      </div>

      <p className="text-center mt-10" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Pagamento processado pelo Mercado Pago
      </p>
    </section>
  );
}

// ============================================================
// Reusable: BackLink
// ============================================================
function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-6 text-sm transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9D97CC] rounded"
      style={{ color: 'rgba(157,151,204,0.7)' }}
      aria-label="Voltar e escolher outra forma de pagamento"
    >
      ← outra forma de pagamento
    </button>
  );
}

// ============================================================
// Pix flow
// ============================================================
function PixFlow({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'qr' | 'error'>('form');
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [pix, setPix] = useState<PixResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PIX_EXPIRATION_MIN * 60);

  const expirationRef = useRef<number | null>(null);

  // Validação
  function validate(): string | null {
    if (!nome.trim() || nome.trim().split(/\s+/).length < 2) return 'Informe seu nome completo.';
    if (!EMAIL_RE.test(email)) return 'Email inválido.';
    if (cpf.replace(/\D/g, '').length !== 11) return 'CPF deve conter 11 dígitos.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) { setValidationError(v); return; }
    setValidationError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/payments/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, cpf: cpf.replace(/\D/g, '') }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Não foi possível gerar o Pix. Tente novamente.');
      }
      const data: PixResponse = await res.json();
      setPix(data);
      const expMs = new Date(data.expiration_date).getTime();
      expirationRef.current = expMs;
      setSecondsLeft(Math.max(0, Math.floor((expMs - Date.now()) / 1000)));
      setStep('qr');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado.');
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  }

  // Countdown
  useEffect(() => {
    if (step !== 'qr' || !expirationRef.current) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((expirationRef.current! - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [step]);

  // Polling de status
  useEffect(() => {
    if (step !== 'qr' || !pix) return;
    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/payments/status/${pix.id}`);
        if (!res.ok) return;
        const data: StatusResponse = await res.json();
        if (stopped) return;
        if (data.status === 'approved') {
          const qs = new URLSearchParams({ payment_id: String(data.id) });
          if (pix.external_reference) qs.set('external_reference', pix.external_reference);
          navigate(`/sucesso?${qs.toString()}`);
        } else if (data.status === 'cancelled' || data.status === 'rejected') {
          setErrorMsg('Pagamento cancelado ou recusado.');
          setStep('error');
        }
      } catch {
        // silencioso — tenta de novo no próximo tick
      }
    };

    const i = setInterval(poll, POLL_INTERVAL_MS);
    return () => { stopped = true; clearInterval(i); };
  }, [step, pix, navigate]);

  async function copyCode() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback se clipboard API falhar
      const el = document.createElement('textarea');
      el.value = pix.qr_code;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* noop */ }
      document.body.removeChild(el);
    }
  }

  // -------- error step
  if (step === 'error') {
    return (
      <section className="px-6 pb-16 mt-6 max-w-md mx-auto">
        <BackLink onBack={onBack} />
        <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(180,60,60,0.06)', border: '1px solid rgba(180,60,60,0.3)' }}>
          <p style={{ color: 'rgba(220,120,120,0.9)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Algo deu errado
          </p>
          <p className="mb-8" style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
            {errorMsg ?? 'Não foi possível gerar o Pix.'}
          </p>
          <button
            onClick={() => { setStep('form'); setErrorMsg(null); }}
            className="px-7 py-3 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)' }}
          >
            Tentar de novo
          </button>
        </div>
      </section>
    );
  }

  // -------- QR step
  if (step === 'qr' && pix) {
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const ss = (secondsLeft % 60).toString().padStart(2, '0');
    const expired = secondsLeft <= 0;

    return (
      <section className="px-6 pb-16 mt-6 max-w-md mx-auto">
        <BackLink onBack={onBack} />
        <div className="rounded-2xl p-7 md:p-8 text-center" style={{ background: 'rgba(196,145,60,0.05)', border: '1px solid rgba(196,145,60,0.25)' }}>
          <p style={{ color: 'rgba(196,145,60,0.95)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Pague com Pix em qualquer app
          </p>

          {!expired ? (
            <>
              <div className="bg-white p-3 rounded-xl inline-block mb-5" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <img
                  src={`data:image/png;base64,${pix.qr_code_base64}`}
                  alt="QR Code para pagamento Pix"
                  width={220}
                  height={220}
                  style={{ display: 'block' }}
                />
              </div>

              <p className="mb-5" style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                Aponte a câmera do app do seu banco, ou{' '}
                <strong style={{ color: '#FDFBFF', fontWeight: 500 }}>copie o código</strong>.
              </p>

              <button
                onClick={copyCode}
                className="w-full py-3.5 rounded-full text-sm font-medium tracking-wide transition-all hover:-translate-y-0.5 mb-5"
                style={{
                  color: '#FDFBFF',
                  background: copied ? 'rgba(120,180,120,0.18)' : 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
                  border: copied ? '1px solid rgba(120,180,120,0.5)' : 'none',
                }}
                aria-live="polite"
              >
                {copied ? '✓ Código copiado' : 'Copiar código Pix'}
              </button>

              <div className="flex items-center gap-2 justify-center" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                <span>Expira em</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#FDFBFF', fontWeight: 500 }}>{mm}:{ss}</span>
              </div>

              <p className="mt-5" style={{ fontSize: '11.5px', color: 'rgba(157,151,204,0.65)', lineHeight: 1.6 }}>
                Estamos aguardando a confirmação do seu banco — não feche esta página.
              </p>
            </>
          ) : (
            <>
              <p className="mb-8" style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
                Esse código Pix expirou. Pode gerar um novo agora.
              </p>
              <button
                onClick={() => { setStep('form'); }}
                className="px-7 py-3 rounded-full text-white text-sm font-medium tracking-wide transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)' }}
              >
                Gerar novo Pix
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // -------- form step
  return (
    <section className="px-6 pb-16 mt-6 max-w-md mx-auto">
      <BackLink onBack={onBack} />
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-7 md:p-8"
        style={{ background: 'rgba(196,145,60,0.05)', border: '1px solid rgba(196,145,60,0.25)' }}
        aria-label="Dados para pagamento Pix"
      >
        <p style={{ color: 'rgba(196,145,60,0.95)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '24px' }}>
          Pagamento via Pix
        </p>

        <div className="flex flex-col gap-4 mb-5">
          <Field id="pix-nome" label="Nome completo" autoComplete="name">
            <input
              id="pix-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              className="checkout-input"
            />
          </Field>
          <Field id="pix-email" label="Email" autoComplete="email">
            <input
              id="pix-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="checkout-input"
            />
          </Field>
          <Field id="pix-cpf" label="CPF" autoComplete="off">
            <input
              id="pix-cpf"
              type="text"
              required
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="checkout-input"
            />
          </Field>
        </div>

        {validationError && (
          <p role="alert" style={{ fontSize: '13px', color: 'rgba(220,120,120,0.95)', marginBottom: '14px' }}>
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-full text-white font-medium tracking-wide transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontSize: '14.5px',
            background: 'linear-gradient(135deg, #C4913C 0%, #8E6420 100%)',
            boxShadow: '0 12px 36px rgba(196,145,60,0.25)',
          }}
        >
          {submitting ? 'Gerando QR Code…' : 'Gerar Pix de R$ 147'}
        </button>

        <p className="mt-5 text-center" style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.32)', lineHeight: 1.6 }}>
          Seus dados são enviados criptografados ao Mercado Pago.
        </p>
      </form>
    </section>
  );
}

// ============================================================
// Field — input wrapper acessível
// ============================================================
function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode; autoComplete?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span style={{ fontSize: '11px', color: 'rgba(157,151,204,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

// ============================================================
// Card flow — usa CardPayment Brick do MP
// ============================================================
function CardFlow({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { ensureMpInit(); }, []);

  if (!MP_PUBLIC_KEY) {
    return (
      <section className="px-6 pb-16 mt-6 max-w-md mx-auto">
        <BackLink onBack={onBack} />
        <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(180,60,60,0.06)', border: '1px solid rgba(180,60,60,0.3)' }}>
          <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
            Configuração de pagamento ausente. Por favor, use Pix ou tente novamente em instantes.
          </p>
        </div>
      </section>
    );
  }

  const initialization = useMemo(() => ({ amount: PRODUCT_PRICE }), []);
  const customization = useMemo(() => ({
    paymentMethods: { maxInstallments: 3 },
    visual: {
      style: {
        theme: 'dark' as const,
        customVariables: {
          baseColor: '#7B5FD4',
          baseColorFirstVariant: '#9D97CC',
          baseColorSecondVariant: '#C4913C',
          borderRadiusLarge: '12px',
          borderRadiusMedium: '10px',
          borderRadiusSmall: '8px',
          formBackgroundColor: 'rgba(255,255,255,0.02)',
          inputBackgroundColor: 'rgba(255,255,255,0.04)',
          textPrimaryColor: '#FDFBFF',
          textSecondaryColor: 'rgba(255,255,255,0.55)',
        },
      },
    },
  }), []);

  return (
    <section className="px-6 pb-16 mt-6 max-w-md mx-auto">
      <BackLink onBack={onBack} />

      <div className="rounded-2xl p-1" style={{ background: 'rgba(107,79,187,0.06)', border: '1px solid rgba(107,79,187,0.30)' }}>
        <div className="px-6 pt-6 pb-2">
          <p style={{ color: 'rgba(157,151,204,0.9)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Pagamento com cartão
          </p>
        </div>

        <CardPayment
          initialization={initialization}
          customization={customization}
          onSubmit={async (formData) => {
            setErrorMsg(null);
            setProcessing(true);
            try {
              const res = await fetch(`${getApiBaseUrl()}/api/payments/card`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || 'Não foi possível processar o pagamento.');
              }
              const data: CardResponse = await res.json();
              const qs = new URLSearchParams({ payment_id: String(data.id) });
              if (data.external_reference) qs.set('external_reference', data.external_reference);
              if (data.status === 'approved') {
                navigate(`/sucesso?${qs.toString()}`);
                return;
              }
              if (data.status === 'in_process' || data.status === 'pending') {
                qs.set('status', 'pending');
                navigate(`/sucesso?${qs.toString()}`);
                return;
              }
              setErrorMsg(friendlyError(data.status_detail, 'Pagamento recusado. Tente outro cartão ou use Pix.'));
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado ao processar o pagamento.');
            } finally {
              setProcessing(false);
            }
          }}
          onError={(err) => {
            console.error('mp_brick_error', err);
            setErrorMsg('Erro no formulário de cartão. Recarregue a página e tente de novo.');
          }}
        />
      </div>

      {processing && (
        <p className="mt-5 text-center" aria-live="polite" style={{ fontSize: '13px', color: 'rgba(157,151,204,0.85)' }}>
          Processando pagamento…
        </p>
      )}

      {errorMsg && (
        <div className="mt-5 rounded-xl px-5 py-4" role="alert" style={{ background: 'rgba(180,60,60,0.08)', border: '1px solid rgba(180,60,60,0.3)' }}>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,200,200,0.95)', lineHeight: 1.55 }}>
            {errorMsg}
          </p>
        </div>
      )}

      <p className="mt-6 text-center" style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
        Seu cartão é processado diretamente pelo Mercado Pago. Não armazenamos dados do cartão.
      </p>
    </section>
  );
}

// ============================================================
// Página
// ============================================================
function Checkout() {
  const [method, setMethod] = useState<Method>(null);

  useEffect(() => {
    document.title = 'Checkout · Protocolo Sono Profundo';
  }, []);

  return (
    <main className="min-h-screen" style={{ background: '#0C0D1A' }}>
      <Header />
      {!method && <MethodSelection onSelect={setMethod} />}
      {method === 'pix' && <PixFlow onBack={() => setMethod(null)} />}
      {method === 'card' && <CardFlow onBack={() => setMethod(null)} />}
    </main>
  );
}

export default Checkout;
