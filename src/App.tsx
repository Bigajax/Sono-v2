import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  CloudRain,
  Flame,
  Lock,
  Moon,
  Music,
  ShieldCheck,
  Sparkles,
  Star,
  Waves,
  Wind,
} from 'lucide-react';
import { useCheckout } from './hooks/useCheckout';
import { warmupBackend } from './lib/warmup';
import { trackPixel } from './lib/tracking';

const VIEW_CONTENT_FIRED_KEY = 'sono_view_content_fired';

// Dispara ViewContent uma única vez por sessão quando o usuário chega
// no bloco de oferta (#oferta) — sinaliza intenção de compra para o algoritmo
// do Meta otimizar e habilita audiência de remarketing.
function useViewContentTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(VIEW_CONTENT_FIRED_KEY)) return;
    } catch {
      /* sessionStorage indisponível: segue */
    }

    const offer = document.getElementById('oferta');
    if (!offer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        trackPixel('ViewContent', {
          content_name: 'Protocolo Sono Profundo — 7 noites',
          content_ids: ['protocolo_sono_7_noites'],
          content_type: 'product',
          value: 147,
          currency: 'BRL',
        });
        try {
          sessionStorage.setItem(VIEW_CONTENT_FIRED_KEY, '1');
        } catch {
          /* ignore */
        }
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(offer);
    return () => observer.disconnect();
  }, []);
}

const MARKETING_STORAGE_KEY = 'sono_mkt_ctx';

// ============================================================
// MARKETING CONTEXT (UTM + referrer): first-touch attribution
// ============================================================

type MarketingUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

type MarketingContext = {
  utm: MarketingUtm;
  referrer?: string;
  landing_path?: string;
};

const UTM_KEYS: (keyof MarketingUtm)[] = ['source', 'medium', 'campaign', 'term', 'content'];

function readMarketingContextFromUrl(): MarketingContext {
  if (typeof window === 'undefined') return { utm: {} };
  const params = new URLSearchParams(window.location.search);
  const utm: MarketingUtm = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(`utm_${k}`);
    if (v) utm[k] = v;
  });
  return {
    utm,
    referrer: document.referrer || undefined,
    landing_path: window.location.pathname + window.location.search,
  };
}

/**
 * Retorna o contexto de marketing (UTM + referrer + landing_path).
 * Preserva first-touch: salva no sessionStorage na primeira chamada com UTMs presentes
 * e retorna o cache em chamadas subsequentes, mesmo que a URL tenha perdido os params.
 */
function getMarketingContext(): MarketingContext {
  if (typeof window === 'undefined') return { utm: {} };
  try {
    const cached = sessionStorage.getItem(MARKETING_STORAGE_KEY);
    if (cached) return JSON.parse(cached) as MarketingContext;
  } catch {
    /* sessionStorage indisponível: segue */
  }
  const fresh = readMarketingContextFromUrl();
  // Só persiste se tiver pelo menos um UTM ou referrer (evita lixar com contexto vazio)
  const hasSignal = Object.keys(fresh.utm).length > 0 || !!fresh.referrer;
  if (hasSignal) {
    try {
      sessionStorage.setItem(MARKETING_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
  }
  return fresh;
}

// ============================================================
// DATA
// ============================================================

type ProtocolNight = {
  night: number;
  title: string;
  duration: string;
  sensation: string;
  imageUrl: string;
};

const protocolNights: ProtocolNight[] = [
  { night: 1, title: 'A noite que seu corpo lembra como parar', duration: '8 min', sensation: '8 minutos. Você deita exausto. Termina mais leve.', imageUrl: '/images/desligando-estado-alerta.webp' },
  { night: 2, title: 'Quando você para de tentar dormir', duration: '9 min', sensation: 'O pensamento perde tração.', imageUrl: '/images/esvaziando-pensamentos.webp' },
  { night: 3, title: 'O peso que sai do peito', duration: '10 min', sensation: 'A tensão desce músculo a músculo.', imageUrl: '/images/respiracao-induz-sono.webp' },
  { night: 4, title: 'A mente para de revisar o dia', duration: '9 min', sensation: 'A mente para de revisar.', imageUrl: '/images/liberando-preocupacoes.webp' },
  { night: 5, title: 'O corpo entende que pode soltar', duration: '11 min', sensation: 'O peito solta.', imageUrl: '/images/criar-seguranca-interna.webp' },
  { night: 6, title: 'A noite em que você não percebe dormindo', duration: '12 min', sensation: 'O sono chega sem força.', imageUrl: '/images/sono-comeca-sozinho.webp' },
  { night: 7, title: 'A noite que não precisa mais ser ensinada', duration: '10 min', sensation: 'O ritual fica automático.', imageUrl: '/images/consolidar-padrao.webp' },
];

const night1 = protocolNights[0];
const restNights = protocolNights.slice(1);

const nightTimeline = [
  { time: '23h', text: 'Você apaga a luz. Sua mente acende.' },
  { time: '01h', text: 'Você olha o relógio. Faz conta.' },
  { time: '04h', text: 'Você acorda. A mente já está ligada.' },
  {
    time: '07h',
    text: 'Café, irritação, cansaço. Hoje à noite vai diferente.\nNão vai.',
  },
];

type FloatingIcon = {
  Icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number | string;
    style?: React.CSSProperties;
  }>;
  size: number;
  position: React.CSSProperties;
  delay: string;
};

const floatingIcons: FloatingIcon[] = [
  { Icon: Moon,      size: 42, position: { top: '10%', left: '5%' },     delay: '0s'   },
  { Icon: CloudRain, size: 36, position: { top: '14%', right: '7%' },    delay: '1s'   },
  { Icon: Flame,     size: 34, position: { top: '40%', left: '3%' },     delay: '2s'   },
  { Icon: Waves,     size: 32, position: { top: '38%', right: '3%' },    delay: '0.5s' },
  { Icon: Music,     size: 34, position: { bottom: '22%', left: '10%' }, delay: '1.5s' },
  { Icon: Wind,      size: 38, position: { bottom: '14%', right: '8%' }, delay: '2.5s' },
  { Icon: Star,      size: 28, position: { bottom: '6%', left: '32%' },  delay: '0.8s' },
  { Icon: Sparkles,  size: 30, position: { top: '60%', right: '6%' },    delay: '1.8s' },
];

const phaseData = [
  { word: 'Respire', color: '#0a0a0a' },
  { word: 'Solte', color: '#0a0a0a' },
  { word: 'Durma', color: '#c4c4be' },
];

const phaseRevealAt = [0.18, 0.48, 0.78];

type Soundscape = {
  image: string;
  name: string;
};

const allSoundscapes: Soundscape[] = [
  { image: '/images/sounds/chuva-suave.webp', name: 'Chuva suave' },
  { image: '/images/sounds/tempestade-leve.webp', name: 'Tempestade leve' },
  { image: '/images/sounds/cachoeira.webp', name: 'Cachoeira' },
  { image: '/images/sounds/riacho.webp', name: 'Riacho' },
  { image: '/images/sounds/vento-arvores.webp', name: 'Vento nas árvores' },
  { image: '/images/sounds/meditacao-profunda.webp', name: 'Meditação Profunda' },
  { image: '/images/sounds/tibetan-bowl.webp', name: 'Taças tibetanas' },
  { image: '/images/sounds/flauta-nativa.webp', name: 'Flauta nativa' },
  { image: '/images/sounds/mantras.webp', name: 'Mantras' },
  { image: '/images/sounds/432hz.webp', name: 'Frequência 432Hz' },
];

const rotateArr = <T,>(arr: T[], n: number): T[] => [...arr.slice(n), ...arr.slice(0, n)];

const partnerCompanies = [
  { name: 'Nubank', logo: '/images/brands/nubank.webp', height: 32 },
  { name: 'iFood', logo: '/images/brands/ifood.webp', height: 34 },
  { name: 'Itaú', logo: '/images/brands/itau.webp', height: 38 },
  { name: 'Globo', logo: '/images/brands/globo.svg', height: 46 },
];

const offerIncludes: string[] = [
  'Acesso ao app com 7 meditações guiadas (8 a 12 min cada), narradas por Arabella',
  '11 ambientes sonoros combináveis dentro do app',
  'Meditação de emergência (3 min, pra noites difíceis)',
  'Acesso vitalício, sem renovação',
  'Garantia incondicional de 7 dias',
];

type FaqItem = { q: string; a: string };

const faqItems: FaqItem[] = [
  {
    q: 'Já tentei Calm, Headspace, melatonina. Por que isso seria diferente?',
    a: 'Esses produtos te dão ferramentas soltas. O app te dá uma sequência fechada. A diferença é que você não precisa decidir nada: é só abrir, apertar play, na ordem. A mente cansada não tem mais uma decisão pra tomar.',
  },
  {
    q: 'Por que pagamento único e não assinatura mensal como os outros apps?',
    a: 'Porque a meta é você não precisar mais do app. Assinatura cria dependência do produto. O protocolo termina em 7 noites. Depois é seu, pra sempre, pra repetir quando precisar.',
  },
  { q: 'Preciso saber meditar pra funcionar?', a: 'Não. O protocolo é áudio guiado. A voz conduz, o som ancora. Você só precisa estar deitado. Se a mente fugir, ela volta sozinha quando ouve a voz.' },
  { q: 'E se eu não conseguir dormir já na primeira noite?', a: 'O objetivo da Noite 1 não é te fazer dormir. É fazer seu corpo perceber que pode baixar a guarda. O sono vem como consequência: às vezes na N1, às vezes na N3. Por isso são 7 noites. Se não funcionar, você tem 7 dias de garantia.' },
  { q: 'Quanto tempo leva pra funcionar?', a: 'A maioria sente diferença na respiração e na tensão do peito ainda na primeira noite. O sono mais consistente costuma aparecer entre a N3 e a N5.' },
  { q: 'Funciona se eu já tomo remédio pra dormir?', a: 'Sim. O protocolo trabalha o sistema nervoso, não substitui medicação. Muitas pessoas usam junto e relatam que o efeito do remédio fica mais limpo.' },
  { q: 'É só áudio? Não vai me encher de notificação?', a: 'Só áudio. De propósito. Notificação, gamificação e tela acesa às 23h é o oposto do que seu sistema nervoso precisa.' },
  { q: 'Posso ouvir mais de uma vez?', a: 'Sim. Acesso vitalício. Muita gente repete a sequência depois de períodos de estresse.' },
  { q: 'E se não funcionar pra mim?', a: '7 dias de garantia incondicional. Você escreve "não funcionou" e devolvemos 100%. Sem formulário, sem ligação, sem pergunta.' },
  { q: 'Vou ser cobrado de novo?', a: 'Não. Pagamento único, acesso vitalício às 7 noites. O ecossistema Ecotopia tem outros conteúdos, mas você descobre no seu tempo. Nenhuma cobrança volta a aparecer.' },
  { q: 'Como recebo o protocolo depois de pagar?', a: 'Na hora. Depois do pagamento via Mercado Pago, você é redirecionado para o app onde cria sua conta (ou faz login se já tem) usando o mesmo email da compra. O acesso é liberado automaticamente e você já consegue ouvir a Noite 1 hoje.' },
];

type Testimonial = {
  name: string;
  initial: string;
  photo: string;
  quote: string;
  age: number;
  city: string;
  status: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Mariana L.',
    initial: 'M',
    photo: '/images/people/mariana.jpg',
    quote:
      'Não foi aquela coisa de apagar do nada. Eu só senti meu corpo parar de brigar com a cama. Foi a primeira noite em meses que não acordei no meio da madrugada calculando horas.',
    age: 38,
    city: 'São Paulo',
    status: 'completou as 7 noites',
  },
  {
    name: 'Caio R.',
    initial: 'C',
    photo: '/images/people/caio.jpg',
    quote:
      'Eu calculava no relógio toda noite: "se eu dormir agora, durmo 4h". Na terceira noite percebi, no meio da madrugada, que tinha parado de fazer essa conta. Só notei de manhã.',
    age: 42,
    city: 'Belo Horizonte',
    status: 'na Noite 5',
  },
  {
    name: 'Fernanda A.',
    initial: 'F',
    photo: '/images/people/fernanda.jpg',
    quote:
      'Não parece meditação. Parece que alguém está explicando pro meu corpo que o dia acabou. Na quarta noite, comecei a dormir antes do áudio terminar.',
    age: 35,
    city: 'Curitiba',
    status: 'completou as 7 noites',
  },
];

// ============================================================
// HOOKS
// ============================================================

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ============================================================
// CTAs
// ============================================================

function OutlineNightsLink({ responsiveFull = false }: { responsiveFull?: boolean }) {
  return (
    <a
      href="#noites"
      className={`btn-outline whitespace-nowrap ${responsiveFull ? '!w-full sm:!w-auto' : ''}`}
    >
      Ver as 7 noites
      <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.25} />
    </a>
  );
}

function PrimaryCheckoutCta({
  id,
  label = 'Quero dormir hoje · R$ 147',
  full = false,
  responsiveFull = false,
  size,
}: {
  id?: string;
  label?: string;
  full?: boolean;
  responsiveFull?: boolean;
  size?: 'lg';
}) {
  const { loading, openCheckout, prewarm } = useCheckout();
  const lgStyle = size === 'lg' ? { padding: '18px', fontSize: '17px' } : undefined;
  const widthClass = full
    ? '!w-full'
    : responsiveFull
      ? '!w-full sm:!w-auto'
      : '';
  return (
    <button
      id={id}
      onClick={openCheckout}
      onMouseEnter={prewarm}
      onFocus={prewarm}
      disabled={loading}
      className={`btn-primary whitespace-nowrap ${widthClass}`}
      style={lgStyle}
    >
      {loading ? 'Abrindo checkout…' : label}
      {!loading && <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.25} />}
    </button>
  );
}

// ============================================================
// NAV
// ============================================================

function Nav() {
  const { loading, openCheckout, prewarm } = useCheckout();
  return (
    <nav className="fixed left-1/2 top-5 z-50 w-[min(640px,calc(100%-24px))] -translate-x-1/2 sm:top-6">
      <div className="nav-pill flex items-center justify-between rounded-full px-5 py-3 sm:px-7 sm:py-3.5">
        <a href="#topo" className="flex items-center">
          <img
            src="/images/logo-nav.webp"
            alt="Ecotopia"
            width={208}
            height={52}
            decoding="async"
            fetchPriority="high"
            className="-my-2 h-12 w-auto object-contain sm:h-[52px]"
          />
        </a>
        <div className="hidden items-center gap-7 sm:flex">
          <a href="#como-funciona" className="text-[14px] font-medium text-[#0a0a0a] transition-opacity hover:opacity-65">
            Como funciona
          </a>
          <a href="#oferta" className="text-[14px] font-medium text-[#0a0a0a] transition-opacity hover:opacity-65">
            Preço
          </a>
        </div>
        <button
          type="button"
          onClick={openCheckout}
          onMouseEnter={prewarm}
          onFocus={prewarm}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-full bg-[#0a0a0a] px-4 py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-60 sm:px-5 sm:py-2.5 sm:text-[14px]"
        >
          {loading ? (
            'Abrindo…'
          ) : (
            <>
              <span className="sm:hidden">Começar</span>
              <span className="hidden sm:inline">Começar esta noite</span>
              <ArrowRight className="h-[14px] w-[14px]" strokeWidth={2.25} />
            </>
          )}
        </button>
      </div>
    </nav>
  );
}

// ============================================================
// 1 · HERO
// ============================================================

function AppIcon() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % protocolNights.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const active = protocolNights[activeIndex];

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-block app-icon-float">
        <div className="app-icon-halo" />
        <div className="pointer-events-none absolute -top-[9px] left-1/2 h-[5px] w-[55%] -translate-x-1/2 rounded-t-[6px] bg-[#dededa]" />
        <div className="pointer-events-none absolute -top-[5px] left-1/2 h-[5px] w-[72%] -translate-x-1/2 rounded-t-[6px] bg-[#c8c8c2]" />

        <div
          className="relative h-[78px] w-[78px] overflow-hidden rounded-[18px] bg-[#0a0a0a] sm:h-[92px] sm:w-[92px] sm:rounded-[20px]"
          style={{ boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.04)' }}
        >
          {protocolNights.map((night, i) => (
            <img
              key={night.night}
              src={night.imageUrl}
              alt=""
              aria-hidden={i !== activeIndex}
              width={92}
              height={92}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 text-center sm:mt-6">
        <p
          key={`eyebrow-${activeIndex}`}
          className="label-flip text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#d4a24c]"
        >
          Noite {active.night} · {active.duration}
        </p>
      </div>

      <span className="sr-only" aria-live="polite">
        Mostrando Noite {active.night}: {active.title}
      </span>
    </div>
  );
}

function Hero() {
  return (
    <section
      id="topo"
      className="relative overflow-hidden px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-[150px]"
    >
      {/* Atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 26%, rgba(212,162,76,0.09) 0%, transparent 65%), radial-gradient(80% 55% at 50% 100%, rgba(10,10,10,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Asymmetric corner mark — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute hidden sm:flex flex-col items-end gap-2"
        style={{ top: '110px', right: '44px' }}
      >
        <div style={{ width: '28px', height: '1px', background: 'rgba(212,162,76,0.45)' }} />
        <p
          className="font-serif italic leading-none"
          style={{ fontSize: '14px', color: 'rgba(212,162,76,0.7)', letterSpacing: '0.02em' }}
        >
          n.<sup style={{ fontSize: '9px' }}>o</sup> 01
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl text-center">

        {/* Eyebrow */}
        <p className="eyebrow reveal-soft mb-9">
          Protocolo Sono Profundo
        </p>

        <div className="reveal-soft flex justify-center">
          <AppIcon />
        </div>

        <h1
          className="reveal-soft animation-delay-100 h-display mx-auto mt-14 max-w-[980px] sm:mt-16"
          style={{
            fontSize: 'clamp(34px, 6.2vw, 80px)',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
          }}
        >
          Você desliga a luz às 23h.
          <br />
          <span
            className="font-serif italic"
            style={{ fontWeight: 300, color: '#6b6b6b', letterSpacing: '-0.02em' }}
          >
            Sua mente continua trabalhando
            <br className="hidden sm:block" />
            {' '}até as 4h.
          </span>
        </h1>

        <p
          className="reveal-soft animation-delay-200 mx-auto mt-8 max-w-[600px] text-[#6b6b6b]"
          style={{ fontSize: 'clamp(16.5px, 1.35vw, 18.5px)', lineHeight: 1.55 }}
        >
          Sete noites para ensinar seu sistema nervoso a soltar. Uma meditação
          por noite, em sequência. Você não escolhe nada — só aperta play.
        </p>

        <div className="reveal-soft animation-delay-300 mx-auto mt-11 flex w-full max-w-[420px] flex-col items-stretch justify-center gap-2.5 sm:max-w-none sm:flex-row sm:items-center sm:gap-3">
          <PrimaryCheckoutCta id="hero-cta" label="Começar esta noite" responsiveFull />
          <OutlineNightsLink responsiveFull />
        </div>

        <p className="reveal-soft animation-delay-400 mx-auto mt-5 max-w-[480px] text-[13px] leading-[1.55] text-[#6b6b6b]">
          <span className="font-bold text-[#d4a24c]">R$ 147</span>
          <span className="text-[#999]">{' '}· pagamento único</span>
        </p>
      </div>
    </section>
  );
}

// ============================================================
// 1B · WHO USES IT
// ============================================================

function WhoUsesIt() {
  return (
    <section className="relative bg-white px-5 py-20 sm:px-8 sm:py-[110px]">
      <div className="mx-auto max-w-[920px]">
        <div className="scroll-reveal mx-auto max-w-[680px] text-center">
          <p className="eyebrow mb-7">Quem usa</p>
          <h2
            className="h-section mx-auto"
            style={{ fontSize: 'clamp(26px, 3.6vw, 42px)' }}
          >
            Profissionais que passam o dia decidindo.
            <br className="hidden sm:block" />
            {' '}
            <span className="text-[#6b6b6b]">
              E descobrem às 2h que a mente
              <br className="sm:hidden" />
              {' '}não tem botão de <span className="italic">off</span>.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-[460px] text-[16.5px] leading-[1.6] text-[#6b6b6b] sm:text-[17.5px]">
            Tecnologia, finanças, mídia. Gente que conhece o teto do quarto às 4h.
          </p>
        </div>

        <div className="scroll-reveal stagger-2 mx-auto mt-14 sm:mt-16">
          <div className="mx-auto flex max-w-[920px] flex-wrap items-center justify-center gap-x-9 gap-y-7 sm:gap-x-16 lg:gap-x-20">
            {partnerCompanies.map(({ name, logo, height }, i) => (
              <img
                key={name}
                src={logo}
                alt={name}
                loading="lazy"
                decoding="async"
                className={`brand-logo w-auto scroll-reveal stagger-${(i % 6) + 1}`}
                style={{
                  height: `${Math.round(height * 0.92)}px`,
                  maxHeight: `${height}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 2 · PAIN MIRROR
// ============================================================

function PainMirror() {
  return (
    <section className="bg-[#fafaf7] px-5 py-20 sm:px-8 sm:py-[120px]">
      <div className="scroll-reveal mx-auto max-w-[760px] text-center">
        <p className="eyebrow mb-7">O diagnóstico errado</p>
        <h2
          className="h-section mx-auto"
          style={{ fontSize: 'clamp(26px, 4.5vw, 56px)' }}
        >
          Você não tem
          <br className="sm:hidden" />
          {' '}insônia clínica.
          <br className="hidden sm:block" />
          {' '}
          <span className="text-[#6b6b6b]">
            Você tem uma mente
            <br className="sm:hidden" />
            {' '}treinada pra não parar.
          </span>
        </h2>
      </div>

      <div className="scroll-reveal mx-auto mt-16 grid max-w-[1080px] gap-8 sm:mt-20 sm:grid-cols-2 sm:gap-10 lg:gap-14">
        <div className="relative overflow-hidden rounded-[20px] bg-[#0a0a0a] aspect-[4/3] sm:aspect-[4/5]">
          <img
            src="/images/quarto-noite-insonia.webp"
            alt="Teto de quarto à noite visto de baixo"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          {nightTimeline.map((item, i) => (
            <div
              key={item.time}
              className={`scroll-reveal stagger-${(i % 5) + 1} flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:gap-7 sm:py-8 ${
                i < nightTimeline.length - 1 ? 'border-b border-[#e5e5e2]' : ''
              }`}
            >
              <p
                className="shrink-0 text-[32px] font-bold leading-none tracking-[-0.01em] text-[#0a0a0a] sm:text-[32px]"
                style={{ fontVariantNumeric: 'tabular-nums', minWidth: '92px' }}
              >
                {item.time}
              </p>
              <p
                className="text-[15.5px] leading-[1.5] text-[#6b6b6b] sm:text-[16px]"
                style={{ whiteSpace: 'pre-line' }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-reveal mx-auto mt-20 max-w-[760px] text-center">
        <p
          className="h-section"
          style={{ fontSize: 'clamp(24px, 3.6vw, 40px)' }}
        >
          Isso não se resolve
          <br className="sm:hidden" />
          {' '}com mais sono.
        </p>
        <p
          className="mx-auto mt-5 max-w-[620px] text-[16.5px] leading-[1.6] text-[#6b6b6b] sm:text-[18px]"
        >
          Se resolve com outro tipo de descanso. Um que a mente reconhece como{' '}
          <span className="font-semibold text-[#0a0a0a]">permissão pra desligar</span>.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// 2B · UNIQUE MECHANISM
// ============================================================

function UniqueMechanism() {
  const layers = [
    {
      numeral: 'i',
      title: 'A voz da Arabella',
      body: 'Guia a regulação do sistema nervoso autônomo — frase por frase, respiração por respiração.',
    },
    {
      numeral: 'ii',
      title: '11 ambientes sonoros',
      body: 'Combináveis dentro do app. Mascaram a ruminação e ancoram a atenção fora da cabeça.',
    },
    {
      numeral: 'iii',
      title: 'Estrutura sequencial',
      body: 'Cada noite condiciona a próxima. Você não recomeça. Você progride.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] px-5 py-24 text-white sm:px-8 sm:py-[140px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 0%, rgba(212,162,76,0.4) 0%, transparent 70%), radial-gradient(45% 40% at 85% 100%, rgba(150,100,200,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[960px]">

        {/* Header */}
        <div className="scroll-reveal text-center">
          <p className="mb-9 inline-flex items-center gap-3 text-[10.5px] uppercase tracking-[0.32em] font-medium" style={{ color: 'rgba(212,162,76,0.85)' }}>
            <span className="h-px w-7" style={{ background: 'rgba(212,162,76,0.45)' }} aria-hidden />
            O mecanismo único
            <span className="h-px w-7" style={{ background: 'rgba(212,162,76,0.45)' }} aria-hidden />
          </p>

          <h2
            className="font-serif font-light leading-[1.04] tracking-tight mx-auto"
            style={{ fontSize: 'clamp(38px, 6.8vw, 72px)', color: '#ffffff' }}
          >
            Sete noites.<br />
            <em className="italic" style={{ color: '#d4a24c' }}>Não mais um Calm.</em>
          </h2>

          <p
            className="mx-auto mt-8 max-w-[480px] font-serif font-light italic"
            style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.48)', lineHeight: 1.7 }}
          >
            A diferença não está no que tem dentro do app.<br className="hidden sm:block" />
            {' '}Está no que ele <em className="not-italic" style={{ color: 'rgba(255,255,255,0.8)' }}>não pede</em> de você.
          </p>
        </div>

        {/* Editorial comparison — no chrome, hairline divider */}
        <div className="scroll-reveal stagger-2 mt-24 sm:mt-28">
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] gap-x-14 items-stretch">

            <div className="text-right pr-2">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Calm · Headspace · etc.
              </p>
              <p className="font-serif font-light" style={{ fontSize: 'clamp(18px, 2.05vw, 24px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.45 }}>
                Eles te dão uma <em className="italic">biblioteca</em>.
              </p>
              <p className="mt-4" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                Você abre, escolhe, desiste, volta amanhã. Vira mais uma decisão pra uma mente que já está cansada de decidir.
              </p>
            </div>

            <div className="flex flex-col items-center self-stretch w-px relative">
              <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,162,76,0.5))' }} />
              <p className="my-4 font-serif italic" style={{ fontSize: '13px', color: 'rgba(212,162,76,0.78)' }}>vs</p>
              <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, rgba(212,162,76,0.5), transparent)' }} />
            </div>

            <div className="text-left pl-2">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-6 font-medium" style={{ color: '#d4a24c' }}>
                Protocolo Sono · 7 noites
              </p>
              <p className="font-serif font-light" style={{ fontSize: 'clamp(18px, 2.05vw, 24px)', color: 'rgba(255,255,255,0.94)', lineHeight: 1.45 }}>
                Aqui você recebe uma <em className="italic" style={{ color: '#d4a24c' }}>sequência</em>.
              </p>
              <p className="mt-4" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
                Uma meditação por noite, na ordem certa. Cada uma prepara a próxima. Você não escolhe nada. Só aperta play.
              </p>
            </div>
          </div>

          <div className="sm:hidden flex flex-col gap-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] mb-5 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Calm · Headspace · etc.
              </p>
              <p className="font-serif font-light mb-3" style={{ fontSize: '22px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                Eles te dão uma <em className="italic">biblioteca</em>.
              </p>
              <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>
                Você abre, escolhe, desiste, volta amanhã. Vira mais uma decisão pra uma mente cansada de decidir.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,162,76,0.45))' }} />
              <p className="font-serif italic" style={{ fontSize: '13px', color: 'rgba(212,162,76,0.78)' }}>vs</p>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(212,162,76,0.45))' }} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] mb-5 font-medium" style={{ color: '#d4a24c' }}>
                Protocolo Sono · 7 noites
              </p>
              <p className="font-serif font-light mb-3" style={{ fontSize: '22px', color: 'rgba(255,255,255,0.94)', lineHeight: 1.4 }}>
                Aqui você recebe uma <em className="italic" style={{ color: '#d4a24c' }}>sequência</em>.
              </p>
              <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
                Uma meditação por noite, na ordem certa. Cada uma prepara a próxima. Você não escolhe nada. Só aperta play.
              </p>
            </div>
          </div>
        </div>

        {/* Strata: three layers stacked */}
        <div className="scroll-reveal stagger-3 mt-28 sm:mt-36">
          <p className="text-center font-serif font-light italic mb-14 mx-auto max-w-[520px]" style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}>
            E cada noite atravessa <em className="not-italic" style={{ color: '#d4a24c' }}>três camadas</em> ao mesmo tempo.
          </p>

          <div className="relative">
            {/* Continuous vertical thread — fixed position, behind numerals */}
            <div
              aria-hidden
              className="absolute w-px"
              style={{
                top: '60px',
                bottom: '60px',
                left: '26px',
                background:
                  'linear-gradient(to bottom, transparent 0%, rgba(212,162,76,0.5) 8%, rgba(212,162,76,0.5) 92%, transparent 100%)',
              }}
            />

            {layers.map((layer, i) => (
              <div
                key={layer.numeral}
                className="relative flex gap-6 sm:gap-10"
              >
                {/* Left rail — numeral, fixed column */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '52px' }}
                >
                  <span
                    className="font-serif italic leading-none relative z-10"
                    style={{
                      fontSize: 'clamp(32px, 3.4vw, 46px)',
                      color: '#d4a24c',
                      padding: '6px 8px',
                      background: '#0a0a0a',
                    }}
                  >
                    {layer.numeral}.
                  </span>
                </div>

                {/* Content — staggered right with progressive indent */}
                <div
                  className="flex-1 py-10 sm:py-14"
                  style={{
                    paddingLeft: `clamp(0px, ${i * 5}vw, ${i * 64}px)`,
                  }}
                >
                  <p
                    className="font-serif font-light tracking-tight"
                    style={{ fontSize: 'clamp(24px, 2.8vw, 32px)', color: '#ffffff', lineHeight: 1.2 }}
                  >
                    {layer.title}
                  </p>
                  <p
                    className="mt-3 max-w-[480px]"
                    style={{ fontSize: 'clamp(14.5px, 1.4vw, 16px)', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}
                  >
                    {layer.body}
                  </p>
                </div>
              </div>
            ))}

            {/* Depth caption */}
            <p
              className="mt-6 sm:mt-8 font-serif italic text-right"
              style={{
                fontSize: '12px',
                color: 'rgba(212,162,76,0.55)',
                letterSpacing: '0.04em',
                paddingRight: '4px',
              }}
            >
              ↓ cada uma um pouco mais fundo
            </p>
          </div>
        </div>

        {/* Closing */}
        <div className="scroll-reveal stagger-4 mt-24 sm:mt-32 max-w-[640px] mx-auto text-center">
          <p
            className="font-serif font-light tracking-tight"
            style={{ fontSize: 'clamp(24px, 3.6vw, 40px)', color: '#ffffff', lineHeight: 1.25 }}
          >
            Na sétima noite, o reflexo já está instalado.
          </p>
          <p
            className="font-serif font-light italic mt-3 tracking-tight"
            style={{ fontSize: 'clamp(24px, 3.6vw, 40px)', color: '#d4a24c', lineHeight: 1.25 }}
          >
            Você pode parar de abrir o app.
          </p>
          <p
            className="font-serif font-light italic mt-5"
            style={{ fontSize: 'clamp(17px, 2vw, 22px)', color: 'rgba(255,255,255,0.5)' }}
          >
            O sono fica.
          </p>
        </div>

      </div>
    </section>
  );
}

// ============================================================
// 3 · MECHANISM
// ============================================================

function Mechanism() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const outroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const denom = section.offsetHeight - window.innerHeight;
      if (denom <= 0) return;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / denom));

      phaseRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = phaseRevealAt[i] - 0.16;
        const end = phaseRevealAt[i];
        let t = (progress - start) / (end - start);
        t = Math.max(0, Math.min(1, t));
        el.style.opacity = String(t);
        el.style.transform = `translate3d(0, ${(1 - t) * 40}px, 0)`;
      });

      if (outroRef.current) {
        const start = 0.86;
        const end = 0.96;
        let t = (progress - start) / (end - start);
        t = Math.max(0, Math.min(1, t));
        outroRef.current.style.opacity = String(t);
        outroRef.current.style.transform = `translate3d(0, ${(1 - t) * 24}px, 0)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="phases-section relative bg-white"
    >
      <div className="phases-sticky sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {floatingIcons.map(({ Icon, size, position, delay }, i) => (
          <div
            key={i}
            aria-hidden
            className="floating-icon absolute z-[1] flex items-center justify-center"
            style={{
              ...position,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: delay,
            }}
          >
            <Icon
              strokeWidth={1.4}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                color: 'rgba(212, 162, 76, 0.42)',
              }}
            />
          </div>
        ))}

        <div className="relative z-[2] flex w-full max-w-[1100px] flex-col items-center px-5 text-center">
          <p className="eyebrow mb-6">Como funciona</p>
          <p className="mx-auto max-w-[480px] text-[15px] font-medium leading-[1.5] text-[#0a0a0a] sm:text-[17px]">
            Três fases.
            <span className="text-[#6b6b6b]"> Você só precisa estar deitado.</span>
          </p>

          <div className="mt-4 flex flex-col items-center sm:mt-6">
            {phaseData.map((p, i) => (
              <h2
                key={p.word}
                ref={(el) => {
                  phaseRefs.current[i] = el;
                }}
                className="h-display phase-word"
                style={{
                  fontSize: 'clamp(36px, 7vw, 96px)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.04em',
                  color: p.color,
                  opacity: 0,
                  transform: 'translate3d(0, 40px, 0)',
                  willChange: 'opacity, transform',
                }}
              >
                {p.word}
              </h2>
            ))}
          </div>

          <div
            ref={outroRef}
            className="mt-16 sm:mt-20"
            style={{
              opacity: 0,
              transform: 'translate3d(0, 24px, 0)',
              willChange: 'opacity, transform',
            }}
          >
            <p className="text-[16px] font-medium text-[#0a0a0a] sm:text-[18px]">
              A voz guia.
            </p>
            <p className="mt-1 text-[15px] text-[#6b6b6b] sm:text-[17px]">
              O corpo lembra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 3A · ARABELLA PREVIEW — pull-quote editorial + player de áudio
// ============================================================

const ARABELLA_AUDIO_SRC = '/audio/arabella-preview.mp3';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ArabellaPreview() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onError = () => setHasError(true);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Pausa automático quando a seção sai da viewport
  useEffect(() => {
    const section = sectionRef.current;
    const audio = audioRef.current;
    if (!section || !audio) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !audio.paused) audio.pause();
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setHasError(true));
    } else {
      audio.pause();
    }
  };

  if (hasError) return null;

  // Hora atual formatada (atualizada na renderização — bom o suficiente)
  const now = new Date();
  const statusTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#fafaf7] px-5 py-20 sm:px-8 sm:py-[120px]"
    >
      <audio
        ref={audioRef}
        src={ARABELLA_AUDIO_SRC}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Glow atmosférico de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 45%, rgba(124,110,246,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[1080px]">
        {/* Header editorial */}
        <div className="mx-auto max-w-[640px] text-center">
          <p className="scroll-reveal eyebrow mb-8">Antes da primeira noite</p>
          <h2
            className="scroll-reveal h-section mx-auto"
            style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
          >
            Conheça a Arabella{' '}
            <span className="text-[#6b6b6b]">e o protocolo.</span>
          </h2>
          <p className="scroll-reveal stagger-1 mx-auto mt-6 max-w-[480px] text-[15px] leading-[1.6] text-[#6b6b6b] sm:text-[16px]">
            Uma introdução de menos de 1 minuto: quem vai te guiar pelas 7 noites
            {' '}e o que esperar do que vem pela frente.
          </p>
        </div>

        {/* Mockup iPhone */}
        <div className="scroll-reveal reveal-scale mx-auto mt-14 flex justify-center sm:mt-16">
          <div className="iphone-mockup">
            {/* Frame */}
            <div className="iphone-frame">
              {/* Side rails (lateral buttons illusion) */}
              <span aria-hidden className="iphone-button iphone-button--volume-up" />
              <span aria-hidden className="iphone-button iphone-button--volume-down" />
              <span aria-hidden className="iphone-button iphone-button--silent" />
              <span aria-hidden className="iphone-button iphone-button--power" />

              {/* Screen */}
              <div className="iphone-screen" style={{ background: '#0C0A1D' }}>
                {/* Dynamic Island */}
                <div className="iphone-dynamic-island" aria-hidden />

                {/* Status bar */}
                <div className="flex items-center justify-between px-7 pt-3.5 text-white">
                  <span className="text-[13px] font-semibold tabular-nums">
                    {statusTime}
                  </span>
                  <span className="flex items-center gap-1">
                    {/* Signal */}
                    <svg width="17" height="11" viewBox="0 0 17 11" fill="white" aria-hidden>
                      <rect x="0"  y="7" width="3" height="4" rx="0.5" />
                      <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                      <rect x="9"  y="3" width="3" height="8" rx="0.5" />
                      <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                    </svg>
                    {/* WiFi */}
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="white" aria-hidden>
                      <path d="M7.5 0C4.5 0 1.7 1 0 2.6L1.4 4.1C3 2.7 5.1 1.9 7.5 1.9c2.4 0 4.5 0.8 6.1 2.2L15 2.6C13.3 1 10.5 0 7.5 0zM7.5 4c-2 0-3.8 0.7-5 1.8l1.4 1.4c1-0.8 2.2-1.3 3.6-1.3 1.4 0 2.6 0.5 3.6 1.3l1.4-1.4c-1.2-1.1-3-1.8-5-1.8zM7.5 8c-1 0-1.8 0.4-2.5 1L7.5 11l2.5-2c-0.7-0.6-1.5-1-2.5-1z"/>
                    </svg>
                    {/* Battery */}
                    <span className="ml-0.5 flex items-center">
                      <span
                        className="relative inline-block rounded-[3.5px]"
                        style={{
                          width: '24px',
                          height: '11px',
                          border: '1px solid rgba(255,255,255,0.4)',
                          padding: '1.5px',
                        }}
                      >
                        <span
                          className="block h-full rounded-[1.5px] bg-white"
                          style={{ width: '78%' }}
                        />
                      </span>
                      <span
                        className="block"
                        style={{
                          width: '1.5px',
                          height: '4px',
                          background: 'rgba(255,255,255,0.4)',
                          marginLeft: '1px',
                          borderRadius: '0 1px 1px 0',
                        }}
                      />
                    </span>
                  </span>
                </div>

                {/* App content — réplica fiel do PlayerScreen */}
                <div className="flex flex-col items-center px-5 pt-7 text-center">
                  {/* Brand — mesma logo do nav, versão clara (branca) para o app dark */}
                  <img
                    src="/images/logo-light.webp"
                    alt="Ecotopia"
                    width={196}
                    height={48}
                    decoding="async"
                    className="h-10 w-auto opacity-75"
                  />

                  {/* Night artwork */}
                  <div
                    className="mt-5 w-full overflow-hidden rounded-[18px]"
                    style={{
                      aspectRatio: '1/1',
                      position: 'relative',
                    }}
                  >
                    <img
                      src="/images/intro-arabella.webp"
                      alt="Introdução do protocolo"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Gradient overlay para legibilidade do badge */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(12,10,29,0.55) 0%, transparent 50%)',
                      }}
                    />
                    {/* Badge "INTRODUÇÃO" — apresentação do protocolo */}
                    <span
                      className="absolute left-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.18em]"
                      style={{
                        background: 'rgba(212,168,71,0.22)',
                        border: '1px solid rgba(212,168,71,0.5)',
                        color: '#F0E3C0',
                      }}
                    >
                      INTRODUÇÃO
                    </span>

                    {/* Wave indicator (quando tocando) */}
                    {isPlaying && (
                      <div
                        aria-hidden
                        className="absolute bottom-3 right-3 flex items-end gap-[3px]"
                      >
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className="iphone-wave-bar"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title + duração */}
                  <h3
                    className="mt-6 font-serif text-[20px] font-medium leading-tight"
                    style={{ color: '#F5F0E8' }}
                  >
                    Conheça a Arabella
                  </h3>
                  <p
                    className="mt-1.5 text-[11.5px] font-medium tracking-wide"
                    style={{ color: 'rgba(245,240,232,0.40)' }}
                  >
                    Apresentação · 1 min
                  </p>

                  {/* Convite a ouvir a introdução */}
                  <p
                    className="mt-7 text-[13.5px] font-medium leading-snug"
                    style={{ color: 'rgba(245,240,232,0.70)' }}
                  >
                    {isPlaying ? (
                      <>Ouvindo a apresentação…</>
                    ) : (
                      <>
                        Toque play e ouça
                        <br />
                        a apresentação do protocolo.
                      </>
                    )}
                  </p>

                  {/* Play button (FUNCIONAL — toca a prévia da Arabella) */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pausar prévia' : 'Tocar prévia da Noite 1'}
                    className={`mt-5 flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform active:scale-[0.94] ${
                      isPlaying ? '' : 'iphone-play-pulse'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, #7C6EF6 0%, #9B8BFF 100%)',
                      boxShadow: '0 12px 32px rgba(124,110,246,0.45)',
                    }}
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden>
                        <rect x="6"  y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                    ) : (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden>
                        <polygon points="6,4 20,12 6,20" />
                      </svg>
                    )}
                  </button>

                  {/* Tempo decorrido (só quando começa a tocar) */}
                  <p
                    className="mt-3 font-mono text-[11px] transition-opacity duration-300"
                    style={{
                      color: 'rgba(245,240,232,0.50)',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '0.05em',
                      opacity: currentTime > 0 ? 1 : 0,
                    }}
                  >
                    {formatTime(currentTime > 0 ? currentTime : 0)}
                  </p>
                </div>

                {/* Home indicator */}
                <div className="iphone-home-indicator" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        {/* Caption editorial */}
        <p className="scroll-reveal stagger-2 mx-auto mt-10 max-w-[480px] text-center text-[13px] leading-[1.65] text-[#6b6b6b] sm:mt-12 sm:text-[14px]">
          A mesma voz que abre cada uma das 7 noites do protocolo.
          {' '}Áudio real, gravado pela Arabella.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// 3B · SOUND EXPERIENCE
// ============================================================

function SoundCard({ image, name }: Soundscape) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
      <div className="zoom-img-container h-12 w-12 shrink-0 rounded-[12px] bg-[#f3f3ee] sm:h-14 sm:w-14 sm:rounded-[14px]">
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <p className="whitespace-nowrap text-[16.5px] font-bold tracking-[-0.005em] text-[#0a0a0a] sm:text-[19px]">
        {name}
      </p>
    </div>
  );
}

function useMarqueeAnimation(
  refs: React.RefObject<HTMLDivElement>[],
  speeds: number[],
  initialOffsets: number[],
) {
  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();
    const offsets = [...initialOffsets];

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50) / 1000;
      lastTime = now;

      refs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth === 0) return;
        offsets[i] += speeds[i] * dt;
        while (offsets[i] <= -halfWidth) offsets[i] += halfWidth;
        while (offsets[i] > 0) offsets[i] -= halfWidth;
        el.style.transform = `translate3d(${offsets[i]}px, 0, 0)`;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [refs, speeds, initialOffsets]);
}

function SoundExperience() {
  const row1 = [...allSoundscapes, ...allSoundscapes];
  const row2 = [...rotateArr(allSoundscapes, 3), ...rotateArr(allSoundscapes, 3)];
  const row3 = [...rotateArr(allSoundscapes, 6), ...rotateArr(allSoundscapes, 6)];

  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [row1Ref, row2Ref, row3Ref], []);
  const speeds = useMemo(() => [-22, 26, -18], []);
  const initialOffsets = useMemo(() => [0, -120, -240], []);
  useMarqueeAnimation(refs, speeds, initialOffsets);

  return (
    <section className="border-y border-[#f0f0ec] bg-[#fafaf7] py-16 sm:py-[100px]">
      <div className="scroll-reveal mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="eyebrow mb-7">O som da sua noite</p>
        <h2 className="h-section mx-auto" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
          Onze sons.
          <br />
          Sua mente escolhe.
        </h2>

        <p className="mx-auto mt-7 max-w-[520px] text-[16px] leading-[1.55] text-[#6b6b6b] sm:text-[17px]">
          A voz de Arabella guia. O som ancora. Você combina dentro do app.
          Nunca a mesma noite duas vezes.
        </p>
      </div>

      <div className="marquee-mask mt-12">
        <div ref={row1Ref} className="marquee-track">
          {row1.map((s, i) => (
            <SoundCard key={`r1-${i}`} {...s} />
          ))}
        </div>
        <div ref={row2Ref} className="marquee-track mt-4">
          {row2.map((s, i) => (
            <SoundCard key={`r2-${i}`} {...s} />
          ))}
        </div>
        <div ref={row3Ref} className="marquee-track mt-4">
          {row3.map((s, i) => (
            <SoundCard key={`r3-${i}`} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 4 · NIGHTS GRID
// ============================================================

function NightsGrid() {
  return (
    <section id="noites" className="bg-[#f3f3ee] px-5 py-20 sm:px-8 sm:py-[120px]">
      <div className="scroll-reveal mx-auto max-w-3xl">
        <p className="eyebrow mb-7">O protocolo</p>
        <h2 className="h-section" style={{ fontSize: 'clamp(30px, 4.5vw, 56px)' }}>
          Sete noites. <br className="sm:hidden" />Em sequência.
          <br />
          <span className="text-[#6b6b6b]">
            Cada uma prepara <br className="sm:hidden" />a próxima.
          </span>
        </h2>
        <p className="mt-7 max-w-xl text-[17px] leading-[1.6] text-[#6b6b6b]">
          Você abre o app, escolhe o ambiente sonoro da noite, aperta play.
          Oito a doze minutos depois, o corpo já está em outro lugar.
        </p>

        <div className="scroll-reveal reveal-scale lift-card mt-12 overflow-hidden rounded-2xl border border-[#e5e5e2] bg-white">
          <div className="zoom-img-container relative">
            <img
              src={night1.imageUrl}
              alt={night1.title}
              loading="lazy"
              decoding="async"
              className="h-[280px] w-full object-cover sm:h-[360px]"
            />
            <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-[#0a0a0a] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white">
              A primeira
            </span>
          </div>
          <div className="px-7 py-7 sm:px-8 sm:py-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#999]">
              Noite 1 · {night1.duration}
            </p>
            <h3 className="mt-2.5 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#0a0a0a] sm:text-[28px]">
              {night1.title}
            </h3>
            <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-[#6b6b6b]">
              {night1.sensation}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:hidden">
          {restNights.map((night, i) => (
            <div
              key={night.night}
              className={`scroll-reveal stagger-${(i % 5) + 1} lift-card flex items-center gap-3 overflow-hidden rounded-2xl border border-[#e5e5e2] bg-white p-3`}
            >
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
                <img
                  src={night.imageUrl}
                  alt={night.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#999]">
                  Noite {night.night} · {night.duration}
                </p>
                <h3 className="mt-1 text-[15.5px] font-bold leading-snug text-[#0a0a0a]">
                  {night.title}
                </h3>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f3ee]">
                <Lock className="h-3.5 w-3.5 text-[#999]" strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 hidden gap-4 sm:grid sm:grid-cols-3">
          {restNights.map((night, i) => (
            <div
              key={night.night}
              className={`scroll-reveal stagger-${(i % 5) + 1} lift-card overflow-hidden rounded-xl border border-[#e5e5e2] bg-white`}
            >
              <div className="relative">
                <img
                  src={night.imageUrl}
                  alt={night.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm">
                  <Lock className="h-3.5 w-3.5 text-[#0a0a0a]" strokeWidth={2} />
                </div>
              </div>
              <div className="px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#999]">
                  Noite {night.night} · {night.duration}
                </p>
                <h3 className="mt-2 text-[18px] font-bold leading-snug text-[#0a0a0a]">
                  {night.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 5 · TESTIMONIALS
// ============================================================

function FeaturedTestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#e5e5e2] bg-white px-6 py-9 transition-all duration-200 sm:px-10 sm:py-12 sm:hover:-translate-y-0.5 sm:hover:border-[#d4d4d0]">
      <span
        aria-hidden
        className="pointer-events-none absolute left-5 top-2 select-none font-black leading-none text-[#d4a24c] opacity-40 sm:left-8 sm:top-4"
        style={{ fontSize: '72px', fontFamily: 'inherit' }}
      >
        “
      </span>

      <blockquote className="relative mt-8 pl-1 sm:mt-6 sm:pl-2">
        <p className="text-[19px] font-medium leading-[1.4] tracking-[-0.005em] text-[#0a0a0a] sm:text-[22px]">
          {t.quote}
        </p>
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-0 select-none font-black leading-none text-[#d4a24c] opacity-40 sm:-bottom-8"
          style={{ fontSize: '72px', fontFamily: 'inherit' }}
        >
          ”
        </span>
      </blockquote>

      <div className="mt-12 border-t border-[#f0f0ec] pt-5 sm:mt-14">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f3f3ee] ring-1 ring-[#e5e5e2]">
            <img
              src={t.photo}
              alt={t.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold tracking-[-0.005em] text-[#0a0a0a]">
              {t.name}
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-[#6b6b6b]">
              {t.age} anos · {t.city} · {t.status}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryTestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="relative overflow-hidden rounded-[20px] border border-[#e5e5e2] bg-white px-6 py-7 transition-all duration-200 sm:px-7 sm:py-8 sm:hover:-translate-y-0.5 sm:hover:border-[#d4d4d0]">
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-2 select-none font-black leading-none text-[#d4a24c] opacity-40 sm:left-5 sm:top-3"
        style={{ fontSize: '48px', fontFamily: 'inherit' }}
      >
        “
      </span>

      <p className="mt-6 text-[16px] font-medium leading-[1.45] tracking-[-0.005em] text-[#0a0a0a] sm:mt-7 sm:text-[17px]">
        {t.quote}
      </p>

      <div className="mt-7 border-t border-[#f0f0ec] pt-4 sm:mt-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#f3f3ee] ring-1 ring-[#e5e5e2]">
            <img
              src={t.photo}
              alt={t.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold tracking-[-0.005em] text-[#0a0a0a]">
              {t.name}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-snug text-[#6b6b6b]">
              {t.age} anos · {t.city} · {t.status}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function Testimonials() {
  const [featured, ...secondary] = testimonials;

  return (
    <section className="bg-[#fafaf7] px-5 py-20 sm:px-8 sm:py-[100px]">
      <div className="mx-auto max-w-[760px]">
        <div className="scroll-reveal text-center">
          <p className="eyebrow mb-7">As mensagens que chegam</p>
          <h2
            className="h-section mx-auto"
            style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
          >
            Três pessoas que pararam
            <br />
            <span className="text-[#6b6b6b]">de fazer conta no relógio.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[440px] text-[16px] leading-[1.55] text-[#6b6b6b]">
            Mensagens reais de quem completou o protocolo.
          </p>
        </div>

        <div className="scroll-reveal reveal-scale mt-14">
          <FeaturedTestimonialCard t={featured} />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {secondary.map((t, i) => (
            <div key={t.name} className={`scroll-reveal stagger-${i + 1}`}>
              <SecondaryTestimonialCard t={t} />
            </div>
          ))}
        </div>

        <p className="scroll-reveal mx-auto mt-14 max-w-[520px] text-center text-[15px] leading-[1.5] text-[#6b6b6b] sm:mt-16">
          A maioria começa na Noite 1
          <br className="sm:hidden" />
          {' '}e termina as 7 sem precisar lembrar.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// 6 · OFFER
// ============================================================

function Offer() {
  return (
    <section id="oferta" className="bg-[#f3f3ee] px-5 py-20 sm:px-8 sm:py-[120px]">
      <div className="scroll-reveal reveal-scale mx-auto max-w-[640px]">
        <div className="offer-card overflow-hidden rounded-3xl bg-white px-6 pb-12 pt-12 sm:px-14 sm:pb-[56px] sm:pt-[56px]">
          <p className="eyebrow mx-auto">
            Protocolo Completo · 7 Noites
          </p>

          <h2
            className="mx-auto mt-6 max-w-md text-center font-black leading-[1.04] tracking-[-0.03em] text-[#0a0a0a]"
            style={{ fontSize: 'clamp(24px, 4vw, 38px)' }}
          >
            <span className="whitespace-nowrap">Sete noites.</span>
            <br />
            <span className="text-[#6b6b6b]">
              Um pagamento.
              <br className="sm:hidden" />
              {' '}Pra repetir quando precisar.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-lg text-center text-[16px] leading-[1.6] text-[#6b6b6b] sm:text-[17px]">
            Em sete noites, seu corpo aprende a encontrar o sono sem ajuda. Você
            desinstala o app se quiser. A capacidade fica.
          </p>

          <ul className="mx-auto my-8 flex max-w-[420px] flex-col gap-3 border-y border-[#f0f0ec] py-5">
            {offerIncludes.map((item, i) => (
              <li key={item} className={`scroll-reveal stagger-${(i % 5) + 1} flex items-start gap-2.5`}>
                <Check
                  className="mt-[3px] h-4 w-4 shrink-0 text-[#d4a24c]"
                  strokeWidth={2.25}
                />
                <span className="text-[14px] font-medium leading-[1.45] text-[#0a0a0a]">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="my-10 text-center">
            <p
              className="font-black leading-[0.95] tracking-[-0.04em] text-[#0a0a0a]"
              style={{ fontSize: 'clamp(64px, 13vw, 96px)' }}
            >
              R$ 147
            </p>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#999]">
              Cobrança única
            </p>
          </div>

          <div className="scroll-reveal stagger-6 mx-auto flex max-w-md items-center gap-2.5 rounded-lg bg-[#fff8ec] px-5 py-3">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#d4a24c]" strokeWidth={2.25} />
            <span className="text-[13px] leading-[1.5] text-[#6b6b6b]">
              Preço de lançamento. Depois passa para <span className="font-bold text-[#0a0a0a]">R$ 247</span>.
            </span>
          </div>

          <div className="mt-8">
            <PrimaryCheckoutCta label="Começar agora · R$ 147" full size="lg" />
          </div>

          <div className="scroll-reveal stagger-7 mx-auto mt-6 flex max-w-md items-start justify-center gap-2.5">
            <ShieldCheck className="mt-[2px] h-4 w-4 shrink-0 text-[#d4a24c]" strokeWidth={2} />
            <p className="text-[13px] leading-[1.55] text-[#6b6b6b]">
              <span className="font-bold text-[#0a0a0a]">Garantia incondicional de 7 dias.</span>{' '}
              Não funcionou? Devolvemos 100%. Sem formulário, sem pergunta. Email basta.
            </p>
          </div>

          <p className="mt-5 text-center text-[12px] font-medium text-[#999]">
            Pagamento seguro via Mercado Pago · Pix, cartão ou boleto
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 7 · FAQ
// ============================================================

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#fafaf7] px-4 py-20 sm:px-8 sm:py-[120px]">
      <div className="scroll-reveal mx-auto max-w-[920px] overflow-hidden rounded-[24px] shadow-[0_8px_32px_rgba(10,10,10,0.04)] sm:rounded-[32px]">
        <div className="bg-[#e8dfd1] px-6 py-9 sm:px-12 sm:py-14">
          <span className="inline-flex items-center rounded-md bg-white/55 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b6b6b]">
            FAQ
          </span>
          <h2
            className="h-section mt-5 sm:mt-7"
            style={{ fontSize: 'clamp(30px, 5vw, 56px)' }}
          >
            Antes de você fechar
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            essa página.
          </h2>
        </div>

        <div className="bg-white px-5 sm:px-12">
          {faqItems.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={i} className={`scroll-reveal stagger-${(i % 6) + 1} border-b border-[#ececea] last:border-b-0`}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left transition-opacity hover:opacity-75 sm:gap-8 sm:py-6"
                  aria-expanded={open}
                >
                  <h3 className="flex-1 text-[15.5px] font-medium leading-snug tracking-[-0.005em] text-[#0a0a0a] sm:text-[17px]">
                    {item.q}
                  </h3>
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:h-10 sm:w-10 ${
                      open
                        ? 'rotate-90 border-[#0a0a0a] bg-[#0a0a0a] text-white'
                        : 'border-[#cfcfca] text-[#0a0a0a]'
                    }`}
                  >
                    <ArrowRight className="h-[14px] w-[14px] sm:h-4 sm:w-4" strokeWidth={2} />
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-400 ease-out ${
                    open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="max-w-2xl pb-6 pr-2 text-[15px] leading-[1.65] text-[#6b6b6b] sm:pb-7 sm:pr-12 sm:text-[16px]">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 8 · FINAL CTA
// ============================================================

function FinalCta() {
  return (
    <section className="bg-[#f3f3ee] px-5 py-24 text-center sm:px-8 sm:py-[140px]">
      <div className="mx-auto max-w-5xl">
        <h2
          className="scroll-reveal h-display mx-auto max-w-[900px]"
          style={{
            fontSize: 'clamp(48px, 6.5vw, 84px)',
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
          }}
        >
          Hoje à noite,
          <br />
          antes da luz apagar.
        </h2>
        <p
          className="scroll-reveal stagger-1 mx-auto mt-8 max-w-xl text-[#6b6b6b]"
          style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', lineHeight: 1.55 }}
        >
          Você abre o app. Aperta play. Oito minutos depois, o corpo já está em outro lugar.
        </p>

        <div className="scroll-reveal stagger-2 mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCheckoutCta label="Quero as 7 noites · R$ 147" size="lg" />
        </div>

        <p className="scroll-reveal stagger-3 mt-8 text-[12px] font-medium tracking-[0.04em] text-[#999]">
          Garantia de 7 dias
        </p>
      </div>
    </section>
  );
}

// ============================================================
// STICKY MOBILE BAR
// ============================================================

function StickyCheckoutBar() {
  const [visible, setVisible] = useState(false);
  const { loading, openCheckout, prewarm } = useCheckout();

  useEffect(() => {
    const heroCta = document.getElementById('hero-cta');
    if (!heroCta) return;

    const updateFromScroll = () => {
      const rect = heroCta.getBoundingClientRect();
      const ctaIsVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setVisible(window.scrollY >= 280 || !ctaIsVisible);
    };

    updateFromScroll();
    window.addEventListener('scroll', updateFromScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateFromScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[80] transition-transform duration-300 ease-out sm:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{
        background: 'rgba(248,248,244,0.92)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        borderTop: '1px solid rgba(10,10,10,0.06)',
        boxShadow: '0 -8px 24px rgba(10,10,10,0.05)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="px-4 pb-3 pt-2.5">
        <div className="mb-2 flex items-center justify-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4a24c]" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b6b6b]">
            Esta noite pode ser diferente
          </p>
        </div>
        <button
          type="button"
          onClick={openCheckout}
          onMouseEnter={prewarm}
          onFocus={prewarm}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0a0a] py-[15px] text-[15.5px] font-bold tracking-[-0.005em] text-white transition-colors hover:bg-[#1a1a1a] active:bg-[#1a1a1a] disabled:opacity-60"
          style={{ boxShadow: '0 8px 20px rgba(10,10,10,0.18)' }}
        >
          <span>{loading ? 'Abrindo checkout…' : 'Quero dormir hoje · R$ 147'}</span>
          {!loading && <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.25} />}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  useScrollReveal();
  useViewContentTracking();
  const { loading: autoCheckoutLoading, openCheckout } = useCheckout();
  const autoCheckoutFired = useRef(false);
  const [autoCheckoutTriggered, setAutoCheckoutTriggered] = useState(false);

  useEffect(() => {
    // Persiste UTMs no sessionStorage logo no primeiro render (first-touch attribution)
    getMarketingContext();
    // Acorda o backend Render (free tier dorme após ~15min) para evitar
    // espera de 30-50s na primeira chamada de checkout
    warmupBackend();
  }, []);

  useEffect(() => {
    if (autoCheckoutFired.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === '1') {
      autoCheckoutFired.current = true;
      setAutoCheckoutTriggered(true);
      openCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#0a0a0a]">
      <main
        className="min-h-screen overflow-x-clip bg-[#fafaf7] text-[#0a0a0a]"
        style={{ borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px' }}
      >
        <Nav />

        <Hero />
        <WhoUsesIt />
        <PainMirror />
        <UniqueMechanism />
        <Mechanism />
        <ArabellaPreview />
        <SoundExperience />
        <NightsGrid />
        <Testimonials />
        <Offer />
        <Faq />
        <FinalCta />
      </main>

      <footer className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-6xl px-6 pb-32 pt-16 sm:px-12 sm:pb-12 sm:pt-20">
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-20">
            <div>
              <img
                src="/images/logo-nav.webp"
                alt="Ecotopia"
                loading="lazy"
                decoding="async"
                className="h-14 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <p className="mt-5 max-w-sm text-[15px] leading-[1.55] text-white/55">
                Um protocolo do ecossistema Ecotopia.
                <br />
                <span className="text-white/40">Sono. Mente. Silêncio.</span>
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:items-end sm:text-right">
              <a
                href="#como-funciona"
                className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70"
              >
                Como funciona
              </a>
              <a
                href="#noites"
                className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70"
              >
                As 7 noites
              </a>
              <a
                href="#oferta"
                className="text-[15px] font-semibold text-white transition-opacity hover:opacity-70"
              >
                Preço
              </a>
            </div>
          </div>

          <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20">
            <p className="mx-auto mt-6 mb-4 max-w-[520px] text-left text-[12px] leading-[1.5] text-[#a8a8a3] sm:text-center">
              Protocolo desenvolvido com base em princípios de regulação do sistema
              nervoso autônomo. Não substitui acompanhamento médico ou psicológico.
            </p>
            <div className="flex flex-col items-start gap-3 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
              <p className="uppercase tracking-[0.08em]">
                Protocolo Sono Profundo · 7 noites
              </p>
              <p>© 2026 Ecotopia</p>
            </div>
          </div>
        </div>
      </footer>

      <StickyCheckoutBar />

      {autoCheckoutTriggered && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-[15px] font-medium text-white">
              {autoCheckoutLoading ? 'Abrindo pagamento seguro…' : 'Redirecionando…'}
            </p>
            <p className="text-[13px] text-white/55">
              Você será levado ao Mercado Pago em instantes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
