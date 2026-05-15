function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: '#F7F5F0' }}>
      <div className="max-w-[540px] mx-auto">

        <div className="flex items-center gap-4 justify-center mb-10 reveal">
          <div className="h-px w-8 bg-accent/25" />
          <p className="text-[10px] tracking-[0.28em] uppercase text-accent" style={{ fontWeight: 400 }}>O que acontece quando você usa</p>
          <div className="h-px w-8 bg-accent/25" />
        </div>

        {/* Narrative block */}
        <div className="reveal text-center mb-14">
          <h2 className="font-serif font-light leading-[1.1] tracking-tight mb-8" style={{ fontSize: 'clamp(26px, 6vw, 40px)', color: '#12121E' }}>
            Você não precisa fazer nada.<br />
            <em className="italic text-accent">Só ouvir.</em>
          </h2>
        </div>

        {/* Steps as narrative */}
        <div className="flex flex-col gap-0 reveal">

          <div className="flex gap-6 pb-10">
            <div className="flex flex-col items-center">
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(107,79,187,0.08)', border: '1px solid rgba(107,79,187,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="font-serif italic" style={{ fontSize: '14px', color: '#6B4FBB', opacity: 0.6 }}>I</span>
              </div>
              <div style={{ flex: 1, width: '1px', background: 'linear-gradient(to bottom, rgba(107,79,187,0.15), transparent)', marginTop: '8px' }} />
            </div>
            <div style={{ paddingTop: '6px', paddingBottom: '0' }}>
              <p style={{ fontSize: '16px', color: '#12121E', fontWeight: 500, marginBottom: '6px' }}>Você deita. Coloca o fone.</p>
              <p style={{ fontSize: '14px', color: '#6E6B85', lineHeight: 1.75 }}>
                Sem precisar estar calmo. Sem precisar "estar no mood". Você só precisa estar deitado.
              </p>
            </div>
          </div>

          <div className="flex gap-6 pb-10">
            <div className="flex flex-col items-center">
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(107,79,187,0.08)', border: '1px solid rgba(107,79,187,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="font-serif italic" style={{ fontSize: '14px', color: '#6B4FBB', opacity: 0.6 }}>II</span>
              </div>
              <div style={{ flex: 1, width: '1px', background: 'linear-gradient(to bottom, rgba(107,79,187,0.15), transparent)', marginTop: '8px' }} />
            </div>
            <div style={{ paddingTop: '6px' }}>
              <p style={{ fontSize: '16px', color: '#12121E', fontWeight: 500, marginBottom: '6px' }}>Nos primeiros minutos, algo muda.</p>
              <p style={{ fontSize: '14px', color: '#6E6B85', lineHeight: 1.75 }}>
                Sua respiração desacelera — sem você tentar.<br />
                Seus pensamentos perdem força — sem você resistir.<br />
                Seu peito afrouxa.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(107,79,187,0.12)', border: '1px solid rgba(107,79,187,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="font-serif italic" style={{ fontSize: '14px', color: '#6B4FBB', opacity: 0.8 }}>III</span>
            </div>
            <div style={{ paddingTop: '6px' }}>
              <p style={{ fontSize: '16px', color: '#12121E', fontWeight: 500, marginBottom: '6px' }}>E então o sono chega.</p>
              <p style={{ fontSize: '14px', color: '#6E6B85', lineHeight: 1.75 }}>
                Não porque você forçou.<br />
                Porque você parou de lutar.
              </p>
            </div>
          </div>

        </div>

        <div className="w-12 h-px mx-auto my-12 reveal" style={{ background: 'rgba(18,18,30,0.08)' }} />

        <p className="font-serif font-light text-center leading-snug tracking-tight reveal" style={{ fontSize: 'clamp(20px, 5vw, 28px)', color: '#12121E' }}>
          A diferença não é técnica.<br />
          <em className="italic text-accent">É que você para de ser seu próprio obstáculo.</em>
        </p>

      </div>
    </section>
  );
}

export default HowItWorks;
