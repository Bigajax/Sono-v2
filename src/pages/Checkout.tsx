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
// Reusable: Trust strip
// ============================================================
function TrustStrip() {
  const items = [
    { Icon: Lock, label: 'Criptografia SSL' },
    { Icon: ShieldCheck, label: 'Mercado Pago' },
    { Icon: Clock, label: 'Garantia 7 dias' },
  ];
  return (
    <div className="mx-auto flex max-w-[560px] flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {items.map(({ Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon className="h-[13px] w-[13px] text-[#d4a24c]" strokeWidth={2} />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6b6b]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Header — eyebrow + título (sem preço; preço agora vive no OrderSummary)
// ============================================================
function Header() {
  return (
    <header className="px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6b6b6b] transition-opacity hover:opacity-65"
      >
        <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={2.25} />
        Voltar para a página
      </Link>

      <div className="mx-auto max-w-[560px] text-center">
        <p
          className="inline-flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: '#d4a24c' }}
        >
          <Lock className="h-[12px] w-[12px]" strokeWidth={2.5} />
          Checkout seguro
        </p>

        <h1
          className="mt-5 font-black leading-[1.02] tracking-[-0.025em] text-[#0a0a0a]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 40px)' }}
        >
          Protocolo Sono Profundo
        </h1>
        <p
          className="mt-2 text-[15px] font-medium tracking-[0.005em] text-[#6b6b6b] sm:text-[16px]"
        >
          7 noites · acesso vitalício
        </p>
      </div>
    </header>
  );
}

// ============================================================
// Order summary — itens incluídos + preço com âncora + garantia
// ============================================================
const ORDER_ITEMS = [
  '7 meditações guiadas, narradas por Arabella (8 a 12 min cada)',
  '11 ambientes sonoros combináveis dentro do app',
  'Meditação de emergência para noites difíceis',
  'Acesso vitalício, sem renovação ou cobrança recorrente',
];

function OrderSummary() {
  return (
    <section className="mx-auto max-w-[560px] px-5 pb-10 sm:px-8" aria-label="Resumo do pedido">
      <div
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: '1px solid #e5e5e2', boxShadow: '0 8px 32px rgba(10,10,10,0.04)' }}
      >
        {/* Items */}
        <div className="px-6 pt-7 pb-2 sm:px-8 sm:pt-8">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#6b6b6b]">
            Seu pedido
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {ORDER_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check
                  className="mt-[3px] h-[15px] w-[15px] shrink-0 text-[#d4a24c]"
                  strokeWidth={2.5}
                />
                <span className="text-[14px] leading-[1.5] text-[#0a0a0a]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price block */}
        <div className="mt-7 border-t border-[#f0f0ec] bg-[#fafaf7] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#6b6b6b]">
                Total
              </p>
              <p className="mt-1 text-[12.5px] font-medium text-[#6b6b6b]">
                Pagamento único · sem mensalidade
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[12.5px] font-medium leading-none text-[#999]"
                style={{ textDecoration: 'line-through', textDecorationThickness: '1.5px' }}
              >
                R$ 247
              </p>
              <p
                className="mt-1 font-black leading-none tracking-[-0.025em] text-[#0a0a0a]"
                style={{ fontSize: 'clamp(32px, 5vw, 42px)' }}
              >
                {formatBRL(PRODUCT_PRICE)}
              </p>
              <p className="mt-1 text-[11.5px] font-medium text-[#6b6b6b]">
                no cartão (até 3x sem juros)
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
              style={{ background: '#d4a24c' }}
            >
              Preço de lançamento
            </span>
            <span className="text-[11.5px] font-medium text-[#6b6b6b]">
              Você economiza R$ 100
            </span>
          </div>

          {/* Pix discount callout */}
          <div
            className="mt-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 sm:px-5"
            style={{
              background: 'rgba(212,162,76,0.08)',
              border: '1px dashed rgba(212,162,76,0.45)',
            }}
          >
            <div className="flex items-start gap-2.5">
              <Zap
                className="mt-[2px] h-[15px] w-[15px] shrink-0 text-[#d4a24c]"
                strokeWidth={2.25}
                fill="#d4a24c"
              />
              <div>
                <p className="text-[12.5px] font-bold leading-tight text-[#0a0a0a]">
                  Pagando no Pix: {formatBRL(PIX_PRICE)}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-[#6b6b6b]">
                  {PIX_DISCOUNT_PCT}% de desconto · economize {formatBRL(PIX_DISCOUNT_AMOUNT)}
                </p>
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white"
              style={{ background: '#d4a24c' }}
            >
              -{PIX_DISCOUNT_PCT}%
            </span>
          </div>
        </div>

        {/* Guarantee strip inside card */}
        <div
          className="flex items-start gap-2.5 border-t border-[#f0f0ec] px-6 py-4 sm:px-8"
          style={{ background: '#fff8ec' }}
        >
          <ShieldCheck
            className="mt-[2px] h-[16px] w-[16px] shrink-0 text-[#d4a24c]"
            strokeWidth={2}
          />
          <p className="text-[12.5px] leading-[1.5] text-[#6b6b6b]">
            <span className="font-bold text-[#0a0a0a]">Garantia incondicional de 7 dias.</span>{' '}
            Não funcionou? Devolvemos 100%. Sem formulário, sem pergunta.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <TrustStrip />
      </div>
    </section>
  );
}

// ============================================================
// Method cards — Pix / Cartão
// ============================================================
function MethodSelection({ onSelect }: { onSelect: (m: Method) => void }) {
  return (
    <section className="mx-auto mt-10 max-w-[640px] px-5 pb-16 sm:px-8" aria-label="Escolher forma de pagamento">
      <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b6b6b]">
        Como você quer pagar?
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Pix card */}
        <button
          type="button"
          onClick={() => onSelect('pix')}
          aria-label={`Pagar com Pix por ${formatBRL(PIX_PRICE)} — ${PIX_DISCOUNT_PCT}% de desconto`}
          className="method-card method-card--pix group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a24c]"
          style={{
            border: '1.5px solid rgba(212,162,76,0.55)',
            boxShadow:
              '0 12px 36px rgba(212,162,76,0.10), 0 0 0 1px rgba(212,162,76,0.10) inset',
          }}
        >
          {/* Eyebrow + ícone */}
          <div className="flex items-start justify-between px-6 pt-6 sm:px-7 sm:pt-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff8ec]">
              <Zap className="h-[22px] w-[22px] text-[#d4a24c]" strokeWidth={2} fill="#d4a24c" />
            </div>
            <span
              aria-hidden
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white"
              style={{ background: '#d4a24c' }}
            >
              -{PIX_DISCOUNT_PCT}% off
            </span>
          </div>

          {/* Title + descrição */}
          <div className="flex-1 px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
            <h3 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#0a0a0a]">
              Pix
            </h3>

            {/* Preço com desconto */}
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="text-[12px] font-medium leading-none text-[#999]"
                style={{ textDecoration: 'line-through' }}
              >
                {formatBRL(PRODUCT_PRICE)}
              </span>
              <span className="text-[20px] font-black leading-none tracking-[-0.015em] text-[#0a0a0a]">
                {formatBRL(PIX_PRICE)}
              </span>
            </div>

            <p className="mt-3 text-[13px] leading-[1.55] text-[#6b6b6b]">
              QR Code na próxima tela. Aprovação imediata e acesso liberado em segundos.
            </p>
          </div>

          {/* Footer CTA */}
          <div
            className="flex items-center justify-between border-t border-[#f0e4cc] px-6 py-4 transition-colors group-hover:bg-[#fff8ec] sm:px-7"
            style={{ background: 'rgba(212,162,76,0.06)' }}
          >
            <span className="text-[13.5px] font-bold tracking-[-0.005em] text-[#0a0a0a]">
              Pagar com Pix
            </span>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-1"
              style={{ background: '#d4a24c' }}
              aria-hidden
            >
              <ArrowRight className="h-[14px] w-[14px] text-white" strokeWidth={2.5} />
            </span>
          </div>
        </button>

        {/* Card */}
        <button
          type="button"
          onClick={() => onSelect('card')}
          aria-label="Pagar com cartão de crédito"
          className="method-card group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]"
          style={{
            border: '1.5px solid #e5e5e2',
            boxShadow: '0 6px 24px rgba(10,10,10,0.04)',
          }}
        >
          {/* Eyebrow + ícone */}
          <div className="flex items-start justify-between px-6 pt-6 sm:px-7 sm:pt-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f3ee]">
              <CreditCard className="h-[22px] w-[22px] text-[#0a0a0a]" strokeWidth={2} />
            </div>
            <span
              aria-hidden
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
              style={{ background: '#f3f3ee', color: '#6b6b6b' }}
            >
              Até 3x s/ juros
            </span>
          </div>

          {/* Title + descrição */}
          <div className="flex-1 px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
            <h3 className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#0a0a0a]">
              Cartão de crédito
            </h3>

            {/* Preço */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[20px] font-black leading-none tracking-[-0.015em] text-[#0a0a0a]">
                {formatBRL(PRODUCT_PRICE)}
              </span>
              <span className="text-[11.5px] font-medium text-[#6b6b6b]">
                ou 3x sem juros
              </span>
            </div>

            <p className="mt-3 text-[13px] leading-[1.55] text-[#6b6b6b]">
              Visa, Mastercard, Elo, Amex e Hipercard. Processado no ambiente do Mercado Pago.
            </p>
          </div>

          {/* Footer CTA */}
          <div
            className="flex items-center justify-between border-t border-[#f0f0ec] bg-[#fafaf7] px-6 py-4 transition-colors group-hover:bg-[#f3f3ee] sm:px-7"
          >
            <span className="text-[13.5px] font-bold tracking-[-0.005em] text-[#0a0a0a]">
              Pagar com cartão
            </span>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              <ArrowRight className="h-[14px] w-[14px] text-white" strokeWidth={2.5} />
            </span>
          </div>
        </button>
      </div>

      <p className="mt-7 text-center text-[11.5px] leading-[1.6] text-[#999]">
        Você é redirecionado ao ambiente seguro do Mercado Pago para concluir o pagamento.
        <br />
        Nenhum dado de cartão fica armazenado em nossos servidores.
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
// Security footer — bloco visível no rodapé
// ============================================================
function SecurityFooter() {
  return (
    <footer className="mx-auto max-w-[640px] px-5 pb-16 sm:px-8">
      <div className="mt-4 rounded-2xl bg-white px-6 py-7 sm:px-8 sm:py-8" style={{ border: '1px solid #e5e5e2' }}>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Lock className="mt-[2px] h-[18px] w-[18px] shrink-0 text-[#d4a24c]" strokeWidth={2} />
            <div>
              <p className="text-[13.5px] font-semibold leading-snug text-[#0a0a0a]">
                Pagamento criptografado
              </p>
              <p className="mt-1 text-[12px] leading-[1.5] text-[#6b6b6b]">
                Conexão SSL. Seus dados viajam protegidos do começo ao fim.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-[2px] h-[18px] w-[18px] shrink-0 text-[#d4a24c]" strokeWidth={2} />
            <div>
              <p className="text-[13.5px] font-semibold leading-snug text-[#0a0a0a]">
                Mercado Pago
              </p>
              <p className="mt-1 text-[12px] leading-[1.5] text-[#6b6b6b]">
                A maior plataforma de pagamentos da América Latina processa sua compra.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-[2px] h-[18px] w-[18px] shrink-0 text-[#d4a24c]" strokeWidth={2} />
            <div>
              <p className="text-[13.5px] font-semibold leading-snug text-[#0a0a0a]">
                Garantia de 7 dias
              </p>
              <p className="mt-1 text-[12px] leading-[1.5] text-[#6b6b6b]">
                Não funcionou? Devolvemos 100% do valor. Sem pergunta.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-[#f0f0ec] pt-6">
          <p className="mb-3 text-center text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#999]">
            Bandeiras aceitas no cartão
          </p>
          <CardBrandsStrip />
        </div>
      </div>

      <p className="mt-6 text-center text-[11.5px] leading-[1.6] text-[#999]">
        Em caso de dúvidas, fale com{' '}
        <a
          href="mailto:ecotopia.app777@gmail.com"
          className="font-semibold text-[#6b6b6b] underline-offset-2 hover:underline"
        >
          ecotopia.app777@gmail.com
        </a>
        .
      </p>

      <p className="mt-5 text-center text-[11px] leading-[1.55] text-[#999]">
        © 2026 Ecotopia · Protocolo Sono Profundo · 7 noites
      </p>
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

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <Header />
      {!method && <OrderSummary />}
      {!method && <MethodSelection onSelect={setMethod} />}
      {method === 'pix' && <PixFlow onBack={() => setMethod(null)} />}
      {method === 'card' && <CardFlow onBack={() => setMethod(null)} />}
      <SecurityFooter />
    </main>
  );
}

export default Checkout;
