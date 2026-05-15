import { useCheckout } from '../hooks/useCheckout';

const ACCENT = '#6B4FBB';

const nights = [
  {
    num: 1, duration: '5 min',
    title: 'Desligando o Estado de Alerta',
    desc: 'A maioria das pessoas deita em modo de batalha. Esta noite você sai dele.',
    image: '/images/desligando-estado-alerta.webp',
    gradient: 'linear-gradient(to bottom, #4A4E8A 0%, #14172E 100%)',
  },
  {
    num: 2, duration: '5 min',
    title: 'Respiração que Induz o Sono',
    desc: 'Uma técnica que desacelera seu sistema nervoso em minutos.',
    image: '/images/respiracao-induz-sono.webp',
    gradient: 'linear-gradient(to bottom, #6B5B95 0%, #251A45 100%)',
  },
  {
    num: 3, duration: '5 min',
    title: 'Esvaziando Pensamentos Repetitivos',
    desc: 'Para quando a mesma coisa fica passando na sua cabeça às 2h da manhã.',
    image: '/images/esvaziando-pensamentos.webp',
    gradient: 'linear-gradient(to bottom, #5B6B95 0%, #1A2545 100%)',
  },
  {
    num: 4, duration: '5 min',
    title: 'Liberando Preocupações do Dia',
    desc: 'O amanhã pode esperar. Esta noite, você descansa.',
    image: '/images/liberando-preocupacoes.webp',
    gradient: 'linear-gradient(to bottom, #7B5B8A 0%, #2A1A40 100%)',
  },
  {
    num: 5, duration: '4 min',
    title: 'Silêncio Interno Guiado',
    desc: 'Quando o silêncio de fora ainda não é suficiente para calar o de dentro.',
    image: '/images/silencio-interno-guiado.webp',
    gradient: 'linear-gradient(to bottom, #4A6B8A 0%, #142045 100%)',
  },
  {
    num: 6, duration: '4 min',
    title: 'Indução ao Sono Profundo',
    desc: 'A noite mais profunda da jornada. Prepare-se para despertar diferente.',
    image: '/images/inducao-sono-profundo.webp',
    gradient: 'linear-gradient(to bottom, #6B4A8A 0%, #20142E 100%)',
  },
  {
    num: 7, duration: '4 min',
    title: 'Consolidação do Novo Padrão',
    desc: 'Você chegou até aqui. Agora isso vira parte de quem você é.',
    image: '/images/consolidacao-padrao-sono.webp',
    gradient: 'linear-gradient(to bottom, #4A5B8A 0%, #14172E 100%)',
  },
];

function NightScreen({ night }: { night: typeof nights[0] }) {
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', height: '152px', position: 'relative', flexShrink: 0 }}>
      <img
        src={night.image}
        alt={night.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: night.gradient, opacity: 0.6 }} />

      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" opacity="0.7"/><polyline points="12 6 12 12 16 14" stroke="white" strokeWidth="1.5" fill="none"/></svg>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '8px', fontWeight: 500, letterSpacing: '0.5px' }}>{night.duration}</span>
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
    </div>
  );
}

function BonusScreen() {
  return (
    <div style={{
      borderRadius: '10px', overflow: 'hidden', height: '152px', position: 'relative', flexShrink: 0,
      background: 'linear-gradient(160deg, #1A0B10 0%, #0F0608 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
      boxShadow: 'inset 0 0 0 1px rgba(180,80,100,0.12)',
    }}>
      <div style={{ width: '24px', height: '1px', background: 'rgba(196,145,60,.35)' }} />
      <p style={{ color: 'rgba(196,145,60,.65)', fontSize: '9px', fontWeight: 400, letterSpacing: '2.5px', textTransform: 'uppercase', textAlign: 'center' }}>
        Bônus
      </p>
      <div style={{ width: '24px', height: '1px', background: 'rgba(196,145,60,.35)' }} />
    </div>
  );
}

function Method() {
  const { loading, openCheckout } = useCheckout();

  return (
    <section className="py-24 text-center overflow-hidden bg-cream">

      {/* Carousel header */}
      <div className="max-w-[580px] mx-auto px-6 mb-6">
        <div className="flex items-center gap-4 justify-center mb-5">
          <div className="h-px w-8 bg-accent/25" />
          <p className="text-[10px] tracking-[0.28em] uppercase text-accent font-light">O protocolo completo</p>
          <div className="h-px w-8 bg-accent/25" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-light leading-[1.1] tracking-tight mb-4">
          Um protocolo de 7 noites.<br />
          <em className="italic text-accent">Cada noite aprofunda mais.</em>
        </h2>
        <p className="text-[14px] text-ink-light font-light leading-relaxed">
          Cada áudio trabalha um nível do seu estado mental até o sono acontecer naturalmente.
          A sequência é o que faz funcionar.
        </p>
      </div>

      <p className="text-[11px] text-ink-light/40 mb-5 px-6 tracking-wider font-light">
        Deslize para ver todas as noites
      </p>

      <div
        className="flex gap-3.5"
        style={{
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          padding: '8px 24px 24px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          alignItems: 'stretch',
        }}
      >
        {nights.map((night) => (
          <div
            key={night.num}
            style={{
              scrollSnapAlign: 'start',
              flexShrink: 0,
              width: '178px',
              background: '#FFFFFF',
              borderRadius: '14px',
              border: night.num === 1 ? `1px solid rgba(107,79,187,0.28)` : '1px solid rgba(107,79,187,0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: night.num === 1 ? '0 4px 20px rgba(107,79,187,0.1)' : '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <NightScreen night={night} />
            <div style={{ padding: '11px 13px 15px', textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: night.num === 1 ? ACCENT : 'rgba(107,79,187,0.45)', fontSize: '8.5px', fontWeight: 400, letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>
                {`Noite ${night.num}`}
              </p>
              <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#12121E', margin: 0, lineHeight: 1.3 }}>{night.title}</p>
              <p style={{ fontSize: '11px', color: 'rgba(18,18,30,0.4)', margin: 0, lineHeight: 1.45, fontWeight: 300, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{night.desc}</p>
            </div>
          </div>
        ))}

        {/* Bonus */}
        <div
          style={{
            scrollSnapAlign: 'start',
            flexShrink: 0,
            width: '178px',
            background: 'rgba(107,79,187,0.03)',
            borderRadius: '14px',
            border: '1px solid rgba(107,79,187,0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 12px rgba(107,79,187,0.06)',
          }}
        >
          <BonusScreen />
          <div style={{ padding: '11px 13px 15px', textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ color: 'rgba(107,79,187,0.45)', fontSize: '8.5px', fontWeight: 400, letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0 }}>Bônus</p>
            <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#12121E', margin: 0, lineHeight: 1.3 }}>SOS – Não Consigo Dormir Hoje</p>
            <p style={{ fontSize: '11px', color: 'rgba(18,18,30,0.4)', margin: 0, lineHeight: 1.45, fontWeight: 300, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>Para quando nada está funcionando e o teto parece longe demais.</p>
          </div>
        </div>

        <div style={{ flexShrink: 0, width: '8px' }} />
      </div>

      {/* CTA inline */}
      <div className="mt-4 px-6">
        <button
          onClick={openCheckout}
          disabled={loading}
          className="px-10 py-4 bg-accent text-white font-medium tracking-wide rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(107,79,187,0.35)] btn-pulse disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ fontSize: '14px' }}
        >
          {loading ? 'Abrindo…' : 'Quero acesso imediato — R$37 →'}
        </button>
        <p className="mt-3 text-[11px] text-ink-light/40 font-light tracking-wider">
          Acesso imediato · 7 áudios + bônus · Pagamento único
        </p>
      </div>
    </section>
  );
}

export default Method;
