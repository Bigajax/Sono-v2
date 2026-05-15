function WhyWorks() {
  return (
    <section className="py-24 px-6 bg-cream">
      <div className="max-w-[560px] mx-auto">

        <div className="text-center mb-14 reveal">
          <div className="flex items-center gap-4 justify-center mb-5">
            <div className="h-px w-8 bg-accent/25" />
            <p className="text-[10px] tracking-[0.28em] uppercase text-accent" style={{ fontWeight: 400 }}>Primeira noite</p>
            <div className="h-px w-8 bg-accent/25" />
          </div>
          <h2 className="font-serif font-light leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(26px, 6vw, 40px)', color: '#12121E' }}>
            O que a maioria das pessoas<br />
            <em className="italic text-accent">sente já na primeira noite.</em>
          </h2>
        </div>

        {/* Visceral outcomes */}
        <div className="flex flex-col gap-3 reveal">

          {[
            {
              before: 'Antes: "meu peito tá acelerado mesmo deitado"',
              after: 'Depois: seu peito afrouxa. Você percebe quando acontece.',
            },
            {
              before: 'Antes: "fico calculando quantas horas de sono ainda dá pra pegar"',
              after: 'Depois: você para de calcular. Sua mente solta.',
            },
            {
              before: 'Antes: "eu virei de lado umas dez vezes e não achei posição"',
              after: 'Depois: seu corpo para de resistir. Você afunda na cama.',
            },
            {
              before: 'Antes: "quando finalmente dormi, acordei no meio da noite de novo"',
              after: 'Depois: a maioria relata dormir de uma vez, sem interrupção.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(107,79,187,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}
            >
              <div className="bg-white px-6 py-4">
                <p style={{ fontSize: '13px', color: 'rgba(18,18,30,0.35)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {item.before}
                </p>
              </div>
              <div style={{ background: 'rgba(107,79,187,0.04)', padding: '14px 24px', borderTop: '1px solid rgba(107,79,187,0.07)' }}>
                <p style={{ fontSize: '13.5px', color: '#12121E', lineHeight: 1.65, fontWeight: 500 }}>
                  {item.after}
                </p>
              </div>
            </div>
          ))}

        </div>

        <div className="w-12 h-px mx-auto my-12 reveal" style={{ background: 'rgba(18,18,30,0.08)' }} />

        <p className="font-serif font-light text-center leading-snug reveal" style={{ fontSize: 'clamp(18px, 4.5vw, 26px)', color: '#12121E' }}>
          Não é que você vai "relaxar".<br />
          <em className="italic text-accent">É que sua mente vai dar permissão para você dormir.</em>
        </p>

      </div>
    </section>
  );
}

export default WhyWorks;
