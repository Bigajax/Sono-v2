import { useCheckout } from '../hooks/useCheckout';

function Hero() {
  const { loading, openCheckout, prewarm } = useCheckout();

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-28 overflow-hidden"
      style={{ background: 'linear-gradient(170deg, #07060E 0%, #0C0D1A 55%, #080912 100%)' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '580px',
          background: 'radial-gradient(ellipse at center, rgba(107,79,187,0.16) 0%, transparent 68%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-30px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '280px',
          background: 'radial-gradient(ellipse at center, rgba(107,79,187,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Label */}
      <div className="flex items-center gap-4 mb-8 animate-fade-up-1">
        <div className="h-px w-8" style={{ background: 'rgba(157,151,204,0.22)' }} />
        <p style={{ color: 'rgba(157,151,204,0.5)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 400 }}>
          Protocolo Sono Profundo
        </p>
        <div className="h-px w-8" style={{ background: 'rgba(157,151,204,0.22)' }} />
      </div>

      {/* H1 */}
      <h1
        className="font-serif font-light leading-[1.07] tracking-tight max-w-[700px] animate-fade-up-2"
        style={{ fontSize: 'clamp(38px, 8.5vw, 68px)', color: '#FDFBFF' }}
      >
        Você deita…<br />
        <em className="italic" style={{ color: '#9D97CC' }}>mas sua mente não desliga.</em>
      </h1>

      {/* Subheadline */}
      <p
        className="mt-7 animate-fade-up-3 max-w-[420px]"
        style={{ fontSize: 'clamp(15px, 3.5vw, 17px)', color: 'rgba(255,255,255,0.42)', lineHeight: 1.8 }}
      >
        Sem remédios. Sem esforço.<br />
        Um método guiado para acalmar sua mente antes de dormir.
      </p>

      {/* CTA principal */}
      <button
        id="hero-cta"
        onClick={openCheckout}
        onMouseEnter={prewarm}
        onFocus={prewarm}
        disabled={loading}
        className="mt-10 px-12 py-5 text-white font-medium tracking-wide rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(107,79,187,0.6)] animate-fade-up-5 btn-pulse disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          fontSize: '15px',
          background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
        }}
      >
        {loading ? 'Abrindo…' : 'Começar esta noite →'}
      </button>

      {/* Microcopy */}
      <p className="mt-4 animate-fade-up-6" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.26)' }}>
        Você não precisa acreditar. Só precisa testar hoje.
      </p>
    </section>
  );
}

export default Hero;
