import { useEffect, useRef } from 'react';

const entries = [
  { time: '22:30', text: 'Você deita achando que hoje vai ser diferente.', dim: false, final: false },
  { time: '23:15', text: 'Lembra de tudo que precisa resolver. Revive conversas. Pensa no amanhã.', dim: false, final: false },
  { time: '00:40', text: 'Tenta respirar fundo. Tenta relaxar. Não funciona.', dim: false, final: false },
  { time: '01:20', text: 'Vira pro lado. Vira pro outro. O corpo tá cansado. A cabeça não para.', dim: false, final: false },
  { time: '02:10', text: 'Pega o celular. Volta pra cama pior do que antes.', dim: false, final: false },
  { time: '03:00', text: 'Faz a conta: "se eu dormir agora, ainda dá 4 horas." Mas você não dorme.', dim: false, final: false },
  { time: '03:47', text: 'Desiste de calcular. Só quer que a noite acabe.', dim: true, final: false },
  { time: '06:30', text: 'O alarme toca. Você levanta destruído. E sabe que hoje à noite vai ser igual.', dim: false, final: true },
];

function NightTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>('.tl-entry');

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          items.forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, i * 200);
          });
        }
      },
      { threshold: 0.06 }
    );

    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-24 px-6" style={{ background: '#08090F' }}>
      <div className="max-w-[580px] mx-auto">

        {/* Title */}
        <h2
          className="reveal font-serif font-light text-center mb-16"
          style={{ color: '#FDFBFF', fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
        >
          Você conhece<br />
          <em className="italic" style={{ color: 'rgba(157,151,204,0.7)' }}>essa noite.</em>
        </h2>

        {/* Timeline */}
        <div ref={containerRef} className="relative">

          <div
            className="absolute"
            style={{
              left: '60px',
              top: '12px',
              bottom: '12px',
              width: '1px',
              background: 'linear-gradient(to bottom, transparent, rgba(157,151,204,.18) 10%, rgba(157,151,204,.18) 90%, transparent)',
            }}
          />

          {entries.map((entry, i) => (
            <div
              key={i}
              className="tl-entry flex items-start mb-8 last:mb-0"
              style={{
                opacity: 0,
                transform: 'translateY(14px)',
                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div
                className="flex-shrink-0 text-right font-light"
                style={{
                  minWidth: '60px',
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  paddingTop: '2px',
                  color: entry.final ? '#C4913C' : entry.dim ? 'rgba(157,151,204,.2)' : 'rgba(157,151,204,.5)',
                }}
              >
                {entry.time}
              </div>

              <div className="flex-shrink-0 flex items-start justify-center px-5 pt-[7px]">
                <div
                  style={{
                    width: entry.final ? '7px' : '5px',
                    height: entry.final ? '7px' : '5px',
                    borderRadius: '50%',
                    background: entry.final ? '#C4913C' : entry.dim ? 'rgba(157,151,204,.12)' : 'rgba(157,151,204,.38)',
                    boxShadow: entry.final ? '0 0 10px rgba(196,145,60,.4)' : 'none',
                    marginTop: entry.final ? '-1px' : '0',
                  }}
                />
              </div>

              <div
                className="flex-1 font-light leading-relaxed"
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: entry.final ? 'rgba(255,255,255,.90)' : entry.dim ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.58)',
                  fontWeight: entry.final ? 400 : 300,
                }}
              >
                {entry.text}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p
          className="reveal mt-16 text-center font-serif font-light"
          style={{
            fontSize: 'clamp(18px, 4.5vw, 26px)',
            color: '#FDFBFF',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
          }}
        >
          E quanto mais tenta dormir,<br />
          <em className="italic" style={{ color: 'rgba(255,255,255,.35)', fontSize: '.85em' }}>mais acordado fica.</em>
        </p>

      </div>
    </section>
  );
}

export default NightTimeline;
