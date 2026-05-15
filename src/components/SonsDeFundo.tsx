const sounds = [
  { id: 'chuva',     title: 'Chuva suave',       image: '/images/sounds/chuva-suave.webp',     selected: true  },
  { id: 'tempest',   title: 'Tempestade leve',    image: '/images/sounds/tempestade-leve.webp', selected: false },
  { id: 'cachoeira', title: 'Cachoeira',          image: '/images/sounds/cachoeira.webp',       selected: false },
  { id: 'riacho',    title: 'Riacho',             image: '/images/sounds/riacho.webp',          selected: false },
  { id: 'vento',     title: 'Vento nas árvores',  image: '/images/sounds/vento-arvores.webp',   selected: false },
  { id: 'tacas',     title: 'Taças tibetanas',    image: '/images/sounds/tibetan-bowl.webp',    selected: false },
  { id: 'flauta',    title: 'Flauta nativa',      image: '/images/sounds/flauta-nativa.webp',   selected: false },
  { id: 'mantras',   title: 'Mantras',            image: '/images/sounds/mantras.webp',         selected: false },
  { id: 'hz432',     title: '432Hz',              image: '/images/sounds/432hz.webp',           selected: false },
];

// ─── iPhone close-up ───────────────────────────────────────────────────────────

function SoundSelectorPhone() {
  return (
    <div style={{ width: '260px', margin: '0 auto', position: 'relative' }}>
      {/* Outer shell */}
      <div style={{
        background: 'linear-gradient(150deg, #2C2C2E 0%, #1C1C1E 45%, #111113 100%)',
        borderRadius: '46px',
        padding: '11px 10px',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.12)',
          'inset 0 0 0 1px rgba(0,0,0,0.55)',
          '0 48px 96px rgba(0,0,0,0.55)',
          '0 16px 40px rgba(107,79,187,0.25)',
        ].join(', '),
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: '-3px', top: '76px', width: '3px', height: '22px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '112px', width: '3px', height: '38px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '158px', width: '3px', height: '38px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: '-3px', top: '124px', width: '3px', height: '60px', background: 'linear-gradient(to left, #080808, #1E1E1E)', borderRadius: '0 2px 2px 0' }} />

        {/* Screen */}
        <div style={{ borderRadius: '37px', overflow: 'hidden', background: '#ffffff', position: 'relative', height: '512px' }}>
          {/* Dynamic Island */}
          <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '86px', height: '26px', background: '#000', borderRadius: '20px', zIndex: 10 }} />

          {/* Status bar */}
          <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '50px', flexShrink: 0 }}>
            <span style={{ color: 'rgba(0,0,0,0.75)', fontSize: '14px', fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>9:41</span>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <svg width="13" height="9" viewBox="0 0 17 12" fill="rgba(0,0,0,0.5)">
                <rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5"/>
                <rect x="9" y="3" width="3" height="9" rx="0.5"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.35"/>
              </svg>
              <div style={{ width: '18px', height: '9px', border: '1.5px solid rgba(0,0,0,0.3)', borderRadius: '2.5px', padding: '1px' }}>
                <div style={{ width: '70%', height: '100%', background: 'rgba(0,0,0,0.5)', borderRadius: '1px' }} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '4px 16px 16px', overflowY: 'hidden', height: 'calc(100% - 50px)' }}>
            {/* Header */}
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: '#111827', fontWeight: 600, fontSize: '15px', margin: '0 0 2px', fontFamily: 'system-ui, sans-serif' }}>Sons de fundo</p>
              <p style={{ color: '#9CA3AF', fontSize: '10px', margin: 0, fontFamily: 'system-ui, sans-serif' }}>Fazemos sugestões personalizadas para você</p>
            </div>

            {/* Volume slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F9FAFB', borderRadius: '20px', padding: '6px 12px', marginBottom: '12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
              <div style={{ flex: 1, position: 'relative', height: '4px', borderRadius: '4px', background: '#E5E7EB' }}>
                <div style={{ width: '13%', height: '100%', background: '#9CA3AF', borderRadius: '4px' }} />
                <div style={{ position: 'absolute', left: '13%', top: '50%', transform: 'translate(-50%,-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#6B7280', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ color: '#374151', fontSize: '10px', fontWeight: 600, minWidth: '24px', textAlign: 'right', fontFamily: 'system-ui, sans-serif' }}>13%</span>
            </div>

            {/* Sound grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {sounds.map((s) => (
                <div key={s.id} style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: s.selected ? '0 0 0 2px #6EC8FF' : '0 1px 4px rgba(0,0,0,0.1)',
                }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
                  <p style={{ position: 'absolute', bottom: '4px', left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: '8px', fontWeight: 500, margin: 0, padding: '0 3px', lineHeight: 1.2, fontFamily: 'system-ui, sans-serif' }}>{s.title}</p>
                  {s.selected && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', background: '#6EC8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="8" height="6" viewBox="0 0 14 10" fill="none"><path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

function SonsDeFundo() {
  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-[560px] mx-auto flex flex-col items-center text-center">

        {/* Label + título */}
        <div className="reveal mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4">Personalização</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
            Sons de Fundo<br />
            <em className="italic text-accent">que aprofundam o relaxamento.</em>
          </h2>
          <p className="text-ink-light text-base leading-relaxed max-w-[420px] mx-auto">
            Escolha o som ambiente que mais combina com você — Chuva, Floresta, Ondas
            ou frequências 432 Hz e 528 Hz. Volume independente da voz guiada.
          </p>
        </div>

        {/* iPhone centralizado */}
        <div className="reveal mb-10" style={{ filter: 'drop-shadow(0 32px 64px rgba(107,79,187,0.2))' }}>
          <SoundSelectorPhone />
        </div>

      </div>
    </section>
  );
}

export default SonsDeFundo;
