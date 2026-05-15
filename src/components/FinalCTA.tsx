import { useCheckout } from '../hooks/useCheckout';

function FinalCTA() {
  const { loading, openCheckout } = useCheckout();

  return (
    <section className="py-28 px-6 text-center" style={{ background: '#08090F' }}>
      <div className="relative max-w-[540px] mx-auto">
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '480px', height: '480px',
            background: 'radial-gradient(ellipse at center, rgba(107,79,187,0.11) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px w-8" style={{ background: 'rgba(157,151,204,.2)' }} />
            <p style={{ color: 'rgba(157,151,204,.45)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 400 }}>
              7 noites · Uma meditação por noite
            </p>
            <div className="h-px w-8" style={{ background: 'rgba(157,151,204,.2)' }} />
          </div>

          <p
            className="font-serif font-light leading-[1.35] mb-2 animate-fade-up-2"
            style={{ fontSize: 'clamp(17px, 4vw, 24px)', color: 'rgba(255,255,255,0.3)' }}
          >
            Você pode continuar tentando dormir sozinho…
          </p>

          <h2
            className="font-serif font-light leading-[1.1] mb-6 tracking-tight animate-fade-up-2"
            style={{ fontSize: 'clamp(30px, 7vw, 50px)', color: '#FDFBFF' }}
          >
            Ou pode testar isso hoje<br />
            <em className="italic" style={{ color: '#9D97CC' }}>e sentir a diferença.</em>
          </h2>

          <p
            className="max-w-[340px] mx-auto mb-10 animate-fade-up-3"
            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.85 }}
          >
            Leva 5 minutos.<br />
            Você não precisa acreditar. Só precisa testar.
          </p>

          <button
            onClick={openCheckout}
            disabled={loading}
            className="mt-2 px-12 py-5 text-white font-medium tracking-wide rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(107,79,187,0.6)] animate-fade-up-4 btn-pulse w-full max-w-[400px] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              fontSize: '15px',
              background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
            }}
          >
            {loading ? 'Abrindo…' : 'Testar agora — R$37 →'}
          </button>

          <p className="mt-8 animate-fade-up-5" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.15em' }}>
            PAGAMENTO SEGURO · SEM MENSALIDADE · ACESSO IMEDIATO
          </p>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
