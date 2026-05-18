import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { getApiBaseUrl } from '../lib/warmup';

const PRODUCT_PRICE = 147;
const PIX_DISCOUNT_PCT = 10;
const PIX_PRICE = Number((PRODUCT_PRICE * (1 - PIX_DISCOUNT_PCT / 100)).toFixed(2)); // 132.30
const PIX_DISCOUNT_AMOUNT = Number((PRODUCT_PRICE - PIX_PRICE).toFixed(2)); // 14.70
const PIX_EXPIRATION_MIN = 15;
const POLL_INTERVAL_MS = 5000;

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

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

// ============================================================
// Helpers
// ============================================================
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
    cc_rejected_call_for_authorize:
      'Você precisa autorizar a compra com seu banco antes de tentar de novo.',
    cc_rejected_card_disabled: 'Cartão desativado. Tente outro cartão ou use Pix.',
    cc_rejected_duplicated_payment: 'Pagamento duplicado detectado. Aguarde alguns minutos.',
    cc_rejected_max_attempts: 'Muitas tentativas. Tente outro cartão ou use Pix.',
  };
  return map[detail] ?? fallback;
}

// ============================================================
// Header — linha minimalista: voltar + selo Checkout seguro
// O título do produto vive dentro do PricingCard, sem duplicar.
// ============================================================
function Header() {
  return (
    <header className="px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-10">
      <div className="mx-auto flex max-w-[640px] flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6b6b6b] transition-opacity hover:opacity-65"
        >
          <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2.25} />
          Voltar para a página
        </Link>
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[10.5px]"
          style={{ color: '#d4a24c' }}
        >
          <Lock className="h-[11px] w-[11px] sm:h-[12px] sm:w-[12px]" strokeWidth={2.5} />
          Checkout seguro
        </span>
      </div>
    </header>
  );
}

// ============================================================
// Pricing card — visual inspirado no shadcn pricing-card:
// faixa diagonal "Recomendado", Switch Cartão/Pix, preço grande,
// features list em 2 estilos (highlight preto / normal cinza) e CTA
// outlined no rodapé.
// ============================================================
type Feature = { name: string; highlight: boolean };

const FEATURES: Feature[] = [
  { name: '7 meditações guiadas, narradas por Arabella (8 a 12 min cada)', highlight: true },
  { name: '11 ambientes sonoros combináveis dentro do app', highlight: true },
  { name: 'Meditação de emergência para noites difíceis', highlight: false },
  { name: 'Acesso vitalício, sem renovação ou cobrança recorrente', highlight: false },
];

// Switch binário com bolinha que desliza — estilo shadcn/radix
function MethodSwitch({
  method,
  onChange,
}: {
  method: NonNullable<Method>;
  onChange: (m: NonNullable<Method>) => void;
}) {
  const isPix = method === 'pix';
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange('card')}
        className={`text-[12.5px] font-medium tracking-[-0.005em] transition-colors ${
          !isPix ? 'text-[#0a0a0a]' : 'text-[#999]'
        }`}
      >
        Cartão
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={isPix}
        aria-label={isPix ? 'Alternar para cartão' : 'Alternar para Pix'}
        onClick={() => onChange(isPix ? 'card' : 'pix')}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c] focus-visible:ring-offset-2"
        style={{ background: isPix ? '#d4a24c' : '#e5e5e2' }}
      >
        <span
          aria-hidden
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(10,10,10,0.2)] transition-transform"
          style={{
            transform: isPix ? 'translateX(22px)' : 'translateX(2px)',
          }}
        />
      </button>
      <button
        type="button"
        onClick={() => onChange('pix')}
        className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium tracking-[-0.005em] transition-colors ${
          isPix ? 'text-[#0a0a0a]' : 'text-[#999]'
        }`}
      >
        Pix
        <span
          className={`inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-bold transition-colors ${
            isPix ? 'bg-[#d4a24c] text-white' : 'bg-[#f0e4cc] text-[#a87f30]'
          }`}
        >
          −{PIX_DISCOUNT_PCT}%
        </span>
      </button>
    </div>
  );
}

function PricingCard({ onContinue }: { onContinue: (m: NonNullable<Method>) => void }) {
  // Padrão = Pix (recomendado, com desconto). O usuário pode trocar antes de continuar.
  const [previewMethod, setPreviewMethod] = useState<NonNullable<Method>>('pix');
  const [isHovered, setIsHovered] = useState(false);

  const isPix = previewMethod === 'pix';
  const currentPrice = isPix ? PIX_PRICE : PRODUCT_PRICE;

  return (
    <section className="mx-auto max-w-[480px] px-5 pb-10 sm:px-8" aria-label="Resumo e pagamento">
      <div
        className="relative overflow-hidden rounded-2xl bg-white transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          border: '1px solid #e5e5e2',
          boxShadow: isHovered
            ? '0 18px 56px rgba(10,10,10,0.10)'
            : '0 8px 28px rgba(10,10,10,0.05)',
        }}
      >
        {/* Faixa "Recomendado" diagonal — só aparece quando Pix selecionado.
            A faixa está recomendando o Pix (pelo desconto), então some ao trocar para cartão. */}
        <div
          aria-hidden={!isPix}
          className="pointer-events-none absolute right-0 top-0 z-10 h-[100px] w-[100px] overflow-hidden transition-opacity duration-300 sm:h-[120px] sm:w-[120px]"
          style={{ opacity: isPix ? 1 : 0 }}
        >
          <div
            className="absolute -right-[30px] top-[18px] rotate-45 px-9 py-1 text-center text-[9.5px] font-bold tracking-[0.12em] text-white shadow-[0_2px_8px_rgba(212,162,76,0.30)] sm:-right-[34px] sm:top-[22px] sm:px-10 sm:py-[5px] sm:text-[10.5px]"
            style={{ background: '#d4a24c' }}
          >
            Recomendado
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pb-6 pt-11 sm:px-9 sm:pb-7 sm:pt-14">
          <h2 className="pr-20 text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#0a0a0a] sm:pr-0 sm:text-[24px]">
            Protocolo Sono Profundo
          </h2>
          <p className="mt-2 text-[14px] leading-[1.55] text-[#6b6b6b] sm:text-[14.5px]">
            7 noites para sua mente aprender a soltar.
          </p>
        </div>

        {/* Pricing + Switch */}
        <div className="space-y-2.5 px-6 pb-1 sm:px-9">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-bold leading-none tracking-[-0.025em] text-[#0a0a0a]"
                style={{
                  fontSize: 'clamp(28px, 7vw, 36px)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatBRL(currentPrice)}
              </span>
              <span className="text-[13px] font-medium text-[#6b6b6b] sm:text-[14px]">
                /{isPix ? 'Pix' : 'cartão'}
              </span>
            </div>

            <MethodSwitch method={previewMethod} onChange={setPreviewMethod} />
          </div>

          {isPix && (
            <p className="text-[12px] font-medium" style={{ color: '#a87f30' }}>
              Você economiza{' '}
              <span className="font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatBRL(PIX_DISCOUNT_AMOUNT)}
              </span>
              {' '}({PIX_DISCOUNT_PCT}%) pagando no Pix
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 px-6 pb-2 pt-7 sm:px-9">
          <div className="text-[14px] font-bold tracking-[-0.005em] text-[#0a0a0a]">
            Incluso:
          </div>
          <ul className="space-y-2.5">
            {FEATURES.map((feature, i) => (
              <li
                key={feature.name}
                className="flex items-start gap-2.5"
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.4s ${i * 80}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                }}
              >
                <span
                  className={`mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                    feature.highlight
                      ? 'text-white'
                      : 'bg-[#f0e4cc] text-[#a87f30]'
                  }`}
                  style={feature.highlight ? { background: '#d4a24c' } : undefined}
                >
                  <Check className="h-[11px] w-[11px]" strokeWidth={3} />
                </span>
                <span className="text-[13.5px] leading-[1.5] text-[#0a0a0a] sm:text-[14px]">
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA outlined */}
        <div className="px-6 pb-7 pt-7 sm:px-9 sm:pb-8 sm:pt-8">
          <button
            type="button"
            onClick={() => onContinue(previewMethod)}
            className="group flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14.5px] font-semibold tracking-[-0.005em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c] focus-visible:ring-offset-2 sm:text-[15px]"
            style={{
              border: '1.5px solid #d4a24c',
              color: '#0a0a0a',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d4a24c';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#0a0a0a';
            }}
          >
            Continuar com {isPix ? 'Pix' : 'cartão'}
            <ArrowRight
              className="h-[15px] w-[15px] transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] leading-[1.55] text-[#999] sm:mt-5">
        Preço de tabela{' '}
        <span style={{ textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>
          {formatBRL(247)}
        </span>
        {' '}· economia de R$ 100 no preço de lançamento
      </p>
    </section>
  );
}


// ============================================================
// BackLink
// ============================================================
function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6b6b6b] transition-opacity hover:opacity-65 focus:outline-none focus-visible:underline"
      aria-label="Voltar e escolher outra forma de pagamento"
    >
      <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2.25} />
      Outra forma de pagamento
    </button>
  );
}

// ============================================================
// Field — input acessível com label uppercase
// ============================================================
function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b6b6b]">
        {label}
      </span>
      {children}
    </label>
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

  function validate(): string | null {
    if (!nome.trim() || nome.trim().split(/\s+/).length < 2) return 'Informe seu nome completo.';
    if (!EMAIL_RE.test(email)) return 'Email inválido.';
    if (cpf.replace(/\D/g, '').length !== 11) return 'CPF deve conter 11 dígitos.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setValidationError(v);
      return;
    }
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
          navigate(`/sucesso?payment_id=${encodeURIComponent(String(data.id))}`);
        } else if (data.status === 'cancelled' || data.status === 'rejected') {
          setErrorMsg('Pagamento cancelado ou recusado.');
          setStep('error');
        }
      } catch {
        /* silencioso */
      }
    };

    const i = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(i);
    };
  }, [step, pix, navigate]);

  async function copyCode() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const el = document.createElement('textarea');
      el.value = pix.qr_code;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        /* noop */
      }
      document.body.removeChild(el);
    }
  }

  if (step === 'error') {
    return (
      <section className="mx-auto mt-6 max-w-[480px] px-5 pb-16 sm:px-8">
        <BackLink onBack={onBack} />
        <div
          className="rounded-2xl bg-white px-7 py-9 text-center"
          style={{ border: '1px solid rgba(180,60,60,0.18)', boxShadow: '0 4px 24px rgba(180,60,60,0.06)' }}
        >
          <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#b03c3c]">
            Algo deu errado
          </p>
          <p className="mb-7 text-[15px] leading-[1.55] text-[#0a0a0a]">
            {errorMsg ?? 'Não foi possível gerar o Pix.'}
          </p>
          <button
            onClick={() => {
              setStep('form');
              setErrorMsg(null);
            }}
            className="btn-primary"
          >
            Tentar de novo
            <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.25} />
          </button>
        </div>
      </section>
    );
  }

  if (step === 'qr' && pix) {
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const ss = (secondsLeft % 60).toString().padStart(2, '0');
    const expired = secondsLeft <= 0;

    return (
      <section className="mx-auto mt-6 max-w-[480px] px-5 pb-16 sm:px-8">
        <BackLink onBack={onBack} />
        <div
          className="rounded-2xl bg-white px-6 py-8 text-center sm:px-8"
          style={{ border: '1px solid #e5e5e2', boxShadow: '0 8px 32px rgba(10,10,10,0.04)' }}
        >
          <p className="mb-6 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#d4a24c]">
            <Zap className="h-3.5 w-3.5" strokeWidth={2.25} fill="#d4a24c" />
            Pix gerado
          </p>

          {!expired ? (
            <>
              <h2 className="mb-2 text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#0a0a0a]">
                Aponte a câmera ou copie o código
              </h2>
              <p className="mb-7 text-[13.5px] leading-[1.6] text-[#6b6b6b]">
                Use o app do seu banco. A confirmação chega em segundos
                {' '}e o acesso é liberado automaticamente.
              </p>

              <div
                className="mx-auto mb-7 inline-block rounded-xl bg-white p-3"
                style={{ border: '1px solid #ececea' }}
              >
                <img
                  src={`data:image/png;base64,${pix.qr_code_base64}`}
                  alt="QR Code para pagamento Pix"
                  width={220}
                  height={220}
                  style={{ display: 'block', borderRadius: '8px' }}
                />
              </div>

              <button
                onClick={copyCode}
                aria-live="polite"
                className={`mb-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-[15px] text-[14.5px] font-bold tracking-[-0.005em] transition-all hover:-translate-y-0.5 ${
                  copied
                    ? 'bg-[#fff8ec] text-[#0a0a0a]'
                    : 'btn-primary'
                }`}
                style={
                  copied
                    ? { border: '1px solid rgba(212,162,76,0.5)' }
                    : undefined
                }
              >
                {copied ? (
                  <>
                    <Check className="h-[15px] w-[15px]" strokeWidth={2.5} />
                    Código copiado
                  </>
                ) : (
                  'Copiar código Pix'
                )}
              </button>

              <div
                className="mb-2 inline-flex items-center gap-2 text-[12.5px] font-medium text-[#6b6b6b]"
                aria-live="polite"
              >
                <Clock className="h-[13px] w-[13px]" strokeWidth={2.25} />
                <span>Expira em</span>
                <span
                  className="text-[#0a0a0a]"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 600,
                  }}
                >
                  {mm}:{ss}
                </span>
              </div>

              <p className="mt-4 text-[12px] leading-[1.6] text-[#999]">
                Estamos aguardando a confirmação do seu banco.
                <br />
                Não feche esta página.
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-[18px] font-bold tracking-[-0.005em] text-[#0a0a0a]">
                Esse código Pix expirou.
              </h2>
              <p className="mb-7 text-[14.5px] leading-[1.6] text-[#6b6b6b]">
                Sem problema. Pode gerar um novo código agora.
              </p>
              <button onClick={() => setStep('form')} className="btn-primary">
                Gerar novo Pix
                <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.25} />
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // form
  return (
    <section className="mx-auto mt-6 max-w-[480px] px-5 pb-16 sm:px-8">
      <BackLink onBack={onBack} />
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white px-6 py-8 sm:px-8"
        style={{ border: '1px solid #e5e5e2', boxShadow: '0 8px 32px rgba(10,10,10,0.04)' }}
        aria-label="Dados para pagamento Pix"
      >
        <p className="mb-1 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#d4a24c]">
          <Zap className="h-3.5 w-3.5" strokeWidth={2.25} fill="#d4a24c" />
          Pagamento via Pix · {PIX_DISCOUNT_PCT}% off
        </p>
        <h2 className="mb-2 mt-3 text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#0a0a0a]">
          Só precisamos dos seus dados básicos
        </h2>
        <div className="mb-6 flex items-baseline gap-2">
          <span
            className="text-[13px] font-medium leading-none text-[#999]"
            style={{ textDecoration: 'line-through' }}
          >
            {formatBRL(PRODUCT_PRICE)}
          </span>
          <span className="text-[22px] font-black leading-none tracking-[-0.02em] text-[#0a0a0a]">
            {formatBRL(PIX_PRICE)}
          </span>
        </div>

        <div className="mb-5 flex flex-col gap-4">
          <Field id="pix-nome" label="Nome completo" autoComplete="name">
            <input
              id="pix-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              className="checkout-input"
              placeholder="Como aparece no seu RG"
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
              placeholder="seu@email.com"
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
          <p
            role="alert"
            className="mb-4 text-[13px] font-medium leading-snug"
            style={{ color: '#b03c3c' }}
          >
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
          style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
        >
          {submitting ? 'Gerando QR Code…' : `Gerar Pix de ${formatBRL(PIX_PRICE)}`}
          {!submitting && <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.25} />}
        </button>

        <p className="mt-3 text-center text-[12px] font-medium text-[#6b6b6b]">
          <span className="text-[#d4a24c]">−{PIX_DISCOUNT_PCT}%</span> de desconto aplicado · você economiza{' '}
          <span className="font-bold text-[#0a0a0a]">{formatBRL(PIX_DISCOUNT_AMOUNT)}</span>
        </p>

        <p className="mt-5 text-center text-[11.5px] leading-[1.6] text-[#999]">
          <Lock className="mr-1 inline h-[11px] w-[11px] text-[#d4a24c]" strokeWidth={2.25} />
          Seus dados são enviados criptografados ao Mercado Pago.
        </p>
      </form>
    </section>
  );
}

// ============================================================
// Card flow — CardPayment Brick
// ============================================================
function CardFlow({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    ensureMpInit();
  }, []);

  if (!MP_PUBLIC_KEY) {
    return (
      <section className="mx-auto mt-6 max-w-[480px] px-5 pb-16 sm:px-8">
        <BackLink onBack={onBack} />
        <div
          className="rounded-2xl bg-white px-7 py-9 text-center"
          style={{ border: '1px solid rgba(180,60,60,0.18)', boxShadow: '0 4px 24px rgba(180,60,60,0.06)' }}
        >
          <p className="text-[14.5px] leading-[1.6] text-[#0a0a0a]">
            Configuração de pagamento ausente. Por favor, use Pix ou tente novamente em instantes.
          </p>
        </div>
      </section>
    );
  }

  const initialization = useMemo(() => ({ amount: PRODUCT_PRICE }), []);
  const customization = useMemo(
    () => ({
      paymentMethods: { maxInstallments: 3 },
      visual: {
        style: {
          theme: 'default' as const,
          customVariables: {
            baseColor: '#0a0a0a',
            baseColorFirstVariant: '#d4a24c',
            baseColorSecondVariant: '#6b6b6b',
            borderRadiusLarge: '14px',
            borderRadiusMedium: '10px',
            borderRadiusSmall: '8px',
            formBackgroundColor: '#ffffff',
            inputBackgroundColor: '#fafaf7',
            textPrimaryColor: '#0a0a0a',
            textSecondaryColor: '#6b6b6b',
            fontWeightSemiBold: '600',
          },
        },
      },
    }),
    []
  );

  return (
    <section className="mx-auto mt-6 max-w-[480px] px-5 pb-16 sm:px-8">
      <BackLink onBack={onBack} />

      <div
        className="rounded-2xl bg-white"
        style={{ border: '1px solid #e5e5e2', boxShadow: '0 8px 32px rgba(10,10,10,0.04)' }}
      >
        <div className="px-6 pt-7 pb-1 sm:px-8">
          <p className="mb-3 inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#d4a24c]">
            <CreditCard className="h-3.5 w-3.5" strokeWidth={2.25} />
            Cartão de crédito
          </p>
          <h2 className="mb-1 text-[20px] font-bold leading-tight tracking-[-0.01em] text-[#0a0a0a]">
            Pagamento processado pelo Mercado Pago
          </h2>
          <p className="mb-5 text-[13px] leading-[1.55] text-[#6b6b6b]">
            Até 3x sem juros. Nenhum dado de cartão fica armazenado conosco.
          </p>
        </div>

        <CardPayment
          initialization={initialization}
          customization={customization}
          onSubmit={async (data) => {
            // SDK pode passar o formData diretamente ou aninhado em { formData } —
            // aceitamos ambos para não quebrar entre versões.
            const formData =
              (data as { formData?: unknown })?.formData ?? data;
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
              if (data.status === 'approved') {
                navigate(`/sucesso?payment_id=${encodeURIComponent(String(data.id))}`);
                return;
              }
              if (data.status === 'in_process' || data.status === 'pending') {
                navigate(
                  `/sucesso?status=pending&payment_id=${encodeURIComponent(String(data.id))}`
                );
                return;
              }
              setErrorMsg(
                friendlyError(data.status_detail, 'Pagamento recusado. Tente outro cartão ou use Pix.')
              );
            } catch (err) {
              setErrorMsg(
                err instanceof Error ? err.message : 'Erro inesperado ao processar o pagamento.'
              );
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
        <p
          className="mt-5 inline-flex items-center justify-center gap-2 text-center text-[13px] font-medium text-[#6b6b6b]"
          aria-live="polite"
        >
          Processando pagamento…
        </p>
      )}

      {errorMsg && (
        <div
          className="mt-5 rounded-xl px-5 py-4"
          role="alert"
          style={{ background: 'rgba(180,60,60,0.06)', border: '1px solid rgba(180,60,60,0.22)' }}
        >
          <p className="text-[13.5px] leading-[1.55] text-[#0a0a0a]">{errorMsg}</p>
        </div>
      )}

      <p className="mt-6 text-center text-[11.5px] leading-[1.6] text-[#999]">
        <Lock className="mr-1 inline h-[11px] w-[11px] text-[#d4a24c]" strokeWidth={2.25} />
        Seu cartão é processado diretamente pelo Mercado Pago. Não armazenamos dados do cartão.
      </p>
    </section>
  );
}

// ============================================================
// Card brands strip — logos oficiais normalizados (altura 32px no DOM)
// ============================================================
const CARD_BRANDS = [
  { name: 'Visa', src: '/images/cards/visa.png' },
  { name: 'Mastercard', src: '/images/cards/mastercard.png' },
  { name: 'Elo', src: '/images/cards/elo.png' },
  { name: 'Amex', src: '/images/cards/amex.png' },
  { name: 'Hipercard', src: '/images/cards/hipercard.png' },
];

function CardBrandsStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-x-6">
      {CARD_BRANDS.map(({ name, src }) => (
        <img
          key={name}
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className="card-brand-logo"
        />
      ))}
    </div>
  );
}

// ============================================================
// Security footer — linha compacta com bandeiras + trust signals
// ============================================================
function SecurityFooter() {
  return (
    <footer className="mx-auto max-w-[640px] px-5 pb-12 sm:px-8">
      <div className="mt-2 flex flex-col items-center gap-5">
        <CardBrandsStrip />

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#999]">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-[11px] w-[11px] text-[#d4a24c]" strokeWidth={2.25} />
            Conexão SSL
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-[12px] w-[12px] text-[#d4a24c]" strokeWidth={2.25} />
            Mercado Pago
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-[11px] w-[11px] text-[#d4a24c]" strokeWidth={2.25} />
            Garantia 7 dias
          </span>
        </div>

        <p className="text-center text-[11.5px] leading-[1.6] text-[#999]">
          Dúvidas?{' '}
          <a
            href="mailto:ecotopia.app777@gmail.com"
            className="font-semibold text-[#6b6b6b] underline-offset-2 hover:underline"
          >
            ecotopia.app777@gmail.com
          </a>
          {' '}· © 2026 Ecotopia
        </p>
      </div>
    </footer>
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

  // Ao trocar de método (seleção / Pix / Cartão), reseta o scroll para o topo
  // — sem isso, o usuário fica "preso" na altura dos cards de método e o
  // formulário do método escolhido fica fora da viewport inicial.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [method]);

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <Header />
      {!method && <PricingCard onContinue={setMethod} />}
      {method === 'pix' && <PixFlow onBack={() => setMethod(null)} />}
      {method === 'card' && <CardFlow onBack={() => setMethod(null)} />}
      <SecurityFooter />
    </main>
  );
}

export default Checkout;
