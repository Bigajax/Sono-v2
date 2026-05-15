import { useCheckout } from '../hooks/useCheckout';

function Pricing() {
  const { loading, openCheckout } = useCheckout();

  return (
    <section className="py-28 px-6 text-center" style={{ background: '#0C0D1A' }} id="preco">
      <div className="relative max-w-[580px] mx-auto">
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '500px', height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(107,79,187,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative reveal">

          <div className="flex items-center gap-4 justify-center mb-8">
            <div className="h-px w-8" style={{ background: 'rgba(157,151,204,.2)' }} />
            <p style={{ color: 'rgba(157,151,204,.45)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 400 }}>
              Protocolo Sono Profundo — 7 noites
            </p>
            <div className="h-px w-8" style={{ background: 'rgba(157,151,204,.2)' }} />
          </div>

          <h2 className="font-serif font-light leading-[1.1] mb-3 tracking-tight" style={{ fontSize: 'clamp(28px, 6.5vw, 44px)', color: '#FDFBFF' }}>
            Acesso completo.<br />
            <em className="italic" style={{ color: '#9D97CC' }}>Uma vez. Para sempre.</em>
          </h2>

          <p className="mb-10 max-w-[340px] mx-auto" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>
            Sem mensalidade. Sem renovação. Você paga uma vez e usa quando quiser.
          </p>

          <div
            className="max-w-[380px] mx-auto rounded-2xl p-8 text-left"
            style={{
              background: 'rgba(107,79,187,0.08)',
              border: '1px solid rgba(107,79,187,0.28)',
              boxShadow: '0 0 48px rgba(107,79,187,0.14)',
            }}
          >
            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '4px' }}>
              <div className="font-serif font-light leading-none" style={{ fontSize: '4rem', color: '#FDFBFF' }}>
                <span style={{ fontSize: '1.5rem', verticalAlign: 'super', opacity: 0.5 }}>R$</span>37
              </div>
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(196,145,60,0.7)', letterSpacing: '0.06em', textDecoration: 'line-through', textDecorationColor: 'rgba(196,145,60,0.4)' }}>
                  R$97
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(157,151,204,0.55)', letterSpacing: '0.06em' }}>
                  pagamento único
                </p>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'rgba(196,145,60,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 500 }}>
              Oferta por tempo limitado
            </p>

            <div className="w-full h-px mb-6" style={{ background: 'rgba(157,151,204,0.1)' }} />

            <div className="flex flex-col gap-3 mb-8">
              {[
                '7 áudios guiados — um por noite',
                'Método progressivo — cada noite aprofunda mais',
                'Bônus: SOS – Não Consigo Dormir Hoje',
                'Acesso imediato no celular',
                'Sem instalar nada',
              ].map((item, i) => (
                <div key={i} className="flex gap-3" style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.58)' }}>
                  <span style={{ color: '#9D97CC', flexShrink: 0, fontSize: '10px', paddingTop: '4px' }}>—</span>
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={openCheckout}
              disabled={loading}
              className="w-full py-4 text-white font-medium tracking-wide rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(107,79,187,0.6)] disabled:opacity-60 disabled:cursor-not-allowed btn-pulse"
              style={{
                fontSize: '15px',
                background: 'linear-gradient(135deg, #7B5FD4 0%, #5A3DB0 100%)',
              }}
            >
              {loading ? 'Abrindo pagamento…' : 'Garantir acesso por R$37 →'}
            </button>

            <p className="mt-4 text-center" style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.24)', lineHeight: 1.65 }}>
              Se não fizer diferença, você para de usar. Sem complicação.
            </p>
          </div>

          <p className="mt-8" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em' }}>
            ACESSO IMEDIATO · PAGAMENTO SEGURO · SEM MENSALIDADE
          </p>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
