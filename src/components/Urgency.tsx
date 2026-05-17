import { useEffect, useState } from 'react';
import { useCheckout } from '../hooks/useCheckout';

function useCountdown() {
  const [time, setTime] = useState({ h: '23', m: '59', s: '59' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      setTime({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function Urgency() {
  const { loading, openCheckout, prewarm } = useCheckout();
  const time = useCountdown();

  return (
    <section className="py-20 px-6" style={{ background: '#0C0D1A' }}>
      <div className="max-w-[480px] mx-auto text-center reveal">

        <div className="flex items-center gap-4 justify-center mb-8">
          <div className="h-px w-8" style={{ background: 'rgba(196,145,60,0.3)' }} />
          <p style={{ color: 'rgba(196,145,60,0.6)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500 }}>
            Oferta por tempo limitado
          </p>
          <div className="h-px w-8" style={{ background: 'rgba(196,145,60,0.3)' }} />
        </div>

        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, marginBottom: '28px' }}>
          Essa oferta encerra hoje à meia-noite.<br />
          Após isso, o preço pode aumentar.
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { val: time.h, label: 'horas' },
            { val: time.m, label: 'min' },
            { val: time.s, label: 'seg' },
          ].map((unit, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="rounded-xl text-center"
                style={{
                  background: 'rgba(107,79,187,0.1)',
                  border: '1px solid rgba(107,79,187,0.22)',
                  minWidth: '76px',
                  padding: '14px 12px',
                }}
              >
                <p
                  className="font-mono font-medium"
                  style={{ fontSize: '2.2rem', color: '#FDFBFF', lineHeight: 1, letterSpacing: '0.05em' }}
                >
                  {unit.val}
                </p>
                <p style={{ fontSize: '9px', color: 'rgba(157,151,204,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '6px' }}>
                  {unit.label}
                </p>
              </div>
              {i < 2 && (
                <span style={{ fontSize: '1.8rem', color: 'rgba(107,79,187,0.4)', fontWeight: 300, lineHeight: 1, paddingBottom: '18px' }}>:</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={openCheckout}
          onMouseEnter={prewarm}
          onFocus={prewarm}
          disabled={loading}
          className="px-12 py-5 text-white font-medium tracking-wide rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(107,79,187,0.6)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontSize: '15px',
            background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
          }}
        >
          {loading ? 'Abrindo…' : 'Garantir R$37 agora →'}
        </button>

        <p className="mt-4" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em' }}>
          PAGAMENTO SEGURO · ACESSO IMEDIATO
        </p>
      </div>
    </section>
  );
}

export default Urgency;
