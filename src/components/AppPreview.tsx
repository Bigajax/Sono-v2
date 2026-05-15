const ACCENT = '#6B4FBB';
const ACCENT_LIGHT = '#9B7FEB';

// ─── iPhone Frame ──────────────────────────────────────────────────────────────

const IPhoneFrame = ({ rotate = 0, children }: { rotate?: number; children: React.ReactNode }) => (
  <div style={{ transform: `rotate(${rotate}deg)`, width: '210px', margin: '0 auto', position: 'relative', flexShrink: 0 }}>
    <div style={{
      background: 'linear-gradient(150deg, #2C2C2E 0%, #1C1C1E 45%, #111113 100%)',
      borderRadius: '40px',
      padding: '9px 8px',
      boxShadow: [
        '0 0 0 1px rgba(255,255,255,0.12)',
        'inset 0 0 0 1px rgba(0,0,0,0.55)',
        '0 40px 80px rgba(0,0,0,0.5)',
        `0 10px 24px rgba(107,79,187,0.16)`,
      ].join(', '),
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: '-3px', top: '66px', width: '3px', height: '18px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: '-3px', top: '97px', width: '3px', height: '32px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: '-3px', top: '137px', width: '3px', height: '32px', background: 'linear-gradient(to right, #080808, #1E1E1E)', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', right: '-3px', top: '106px', width: '3px', height: '50px', background: 'linear-gradient(to left, #080808, #1E1E1E)', borderRadius: '0 2px 2px 0' }} />
      <div style={{ borderRadius: '32px', overflow: 'hidden', background: '#06061A', position: 'relative', height: '436px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: '9px', left: '50%', transform: 'translateX(-50%)', width: '76px', height: '22px', background: '#000', borderRadius: '18px', zIndex: 10 }} />
        <div style={{ padding: '12px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '44px', flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 700 }}>9:41</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <svg width="11" height="8" viewBox="0 0 17 12" fill="rgba(255,255,255,0.7)">
              <rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5"/>
              <rect x="9" y="3" width="3" height="9" rx="0.5"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.35"/>
            </svg>
            <div style={{ width: '15px', height: '7px', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '2px', padding: '1px' }}>
              <div style={{ width: '70%', height: '100%', background: 'rgba(255,255,255,0.7)', borderRadius: '1px' }} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  </div>
);

// ─── Session Thumbnail ─────────────────────────────────────────────────────────

const SessionThumb = ({ day, done, active }: { day: number; done?: boolean; active?: boolean }) => {
  const hue = 240 + day * 8;
  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},60%,${done ? 20 : 28}%) 0%, hsl(${hue + 20},70%,${done ? 14 : 18}%) 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: done ? 0.45 : 1,
      border: active ? `1.5px solid rgba(107,79,187,0.6)` : '1.5px solid rgba(255,255,255,0.05)',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill={done ? 'rgba(255,255,255,0.35)' : active ? ACCENT_LIGHT : 'rgba(255,255,255,0.55)'}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </div>
  );
};

// ─── iPhone 1: Session List ────────────────────────────────────────────────────

const SessionListMockup = ({ rotate = 0 }: { rotate?: number }) => {
  const sessions = [
    { day: 1, title: 'Desligando o Estado de Alerta', done: true },
    { day: 2, title: 'Respiração que Induz o Sono', active: true },
    { day: 3, title: 'Esvaziando Pensamentos' },
    { day: 4, title: 'Liberando Preocupações' },
    { day: 5, title: 'Silêncio Interno Guiado' },
    { day: 6, title: 'Indução ao Sono Profundo' },
    { day: 7, title: 'Consolidação do Padrão' },
  ] as { day: number; title: string; done?: boolean; active?: boolean }[];

  return (
    <IPhoneFrame rotate={rotate}>
      <div style={{ background: 'linear-gradient(180deg, #080818 0%, #0C0B24 100%)', height: '100%' }}>
        <div style={{ padding: '6px 12px 8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 2px' }}>Protocolo Sono Profundo</p>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>7 Meditações</p>
        </div>
        <div style={{ padding: '0 12px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px' }}>Progresso</span>
            <span style={{ color: ACCENT_LIGHT, fontSize: '8px', fontWeight: 700 }}>1 / 7 noites</span>
          </div>
          <div style={{ width: '100%', height: '2.5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
            <div style={{ width: '14%', height: '100%', background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`, borderRadius: '3px' }} />
          </div>
        </div>
        <div style={{ padding: '0 8px 8px' }}>
          {sessions.map((s) => (
            <div key={s.day} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '5px 8px', borderRadius: '10px', marginBottom: '2.5px',
              background: s.active ? 'rgba(107,79,187,0.16)' : s.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              border: s.active ? `1px solid rgba(107,79,187,0.35)` : '1px solid transparent',
            }}>
              <SessionThumb day={s.day} done={s.done} active={s.active} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: s.active ? 'white' : s.done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.65)', fontSize: '9.5px', fontWeight: s.active ? 700 : 400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Noite {s.day} · {s.title}
                </p>
              </div>
              {s.done ? (
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(107,79,187,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={ACCENT_LIGHT} strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
              ) : s.active ? (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 10px rgba(107,79,187,0.45)` }}>
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              ) : (
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="6" height="6" viewBox="0 0 24 24" fill="rgba(255,255,255,0.18)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 8px', borderRadius: '10px', marginTop: '2px', background: 'rgba(107,79,187,0.07)', border: '1px solid rgba(107,79,187,0.15)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'rgba(107,79,187,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🎁</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9.5px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bônus: SOS – Não Consigo Dormir</p>
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
};

// ─── iPhone 2: Player ─────────────────────────────────────────────────────────

const PlayerMockup = ({ rotate = 0 }: { rotate?: number }) => (
  <IPhoneFrame rotate={rotate}>
    <div style={{ background: 'linear-gradient(180deg, #0C0820 0%, #1A0E3A 45%, #080614 100%)', height: '100%' }}>
      <div style={{ padding: '4px 12px 0' }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
      </div>
      <div style={{ padding: '8px 0 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '130px', height: '130px', borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #2A1660 0%, #130A32 50%, #060314 100%)`,
          boxShadow: `0 14px 36px rgba(107,79,187,0.35), 0 0 0 1px rgba(107,79,187,0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {[[30,25],[70,40],[20,60],[80,70],[50,80],[15,80],[60,20],[90,50],[40,50]].map(([x,y],i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: i%3===0?'2px':'1px', height: i%3===0?'2px':'1px', borderRadius: '50%', background: `rgba(255,255,255,${0.2+(i%4)*0.15})` }} />
          ))}
          <svg width="46px" height="46px" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(155,127,235,0.6))' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={ACCENT_LIGHT} opacity="0.9"/>
          </svg>
        </div>
      </div>
      <div style={{ padding: '10px 16px 0', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 2px' }}>Protocolo · Noite 1</p>
        <p style={{ color: 'white', fontWeight: 700, fontSize: '11.5px', lineHeight: '1.3', margin: 0 }}>Desligando o Estado de Alerta</p>
      </div>
      <div style={{ padding: '14px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
        {[
          <svg key="b" width="13" height="11" viewBox="0 0 24 24" fill="white"><path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L3 8v6h6l-2.18-2.18A6.93 6.93 0 0 1 12.5 10c3.04 0 5.64 1.96 6.58 4.69l1.95-.65A9 9 0 0 0 12.5 8z"/></svg>,
          null,
          <svg key="f" width="13" height="11" viewBox="0 0 24 24" fill="white"><path d="M11.5 8c2.65 0 5.05 1 6.9 2.6L21 8v6h-6l2.18-2.18A6.93 6.93 0 0 0 11.5 10c-3.04 0-5.64 1.96-6.58 4.69L2.97 14.04A9 9 0 0 1 11.5 8z"/></svg>,
        ].map((icon, i) => (
          i === 1 ? (
            <div key={i} style={{ background: ACCENT, borderRadius: '50px', padding: '9px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 5px 18px rgba(107,79,187,0.5)` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            </div>
          ) : (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50px', padding: '6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              {icon}
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '6.5px', fontWeight: 600 }}>15s</span>
            </div>
          )
        ))}
      </div>
      <div style={{ margin: '12px 0 0', background: 'rgba(0,0,0,0.4)', borderRadius: '16px 16px 0 0', padding: '10px 12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '50px', padding: '5px 9px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '6.5px', letterSpacing: '1px', fontWeight: 600, margin: 0 }}>SONS DE FUNDO</p>
              <p style={{ color: 'white', fontSize: '9px', fontWeight: 700, margin: 0 }}>Chuva</p>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '7.5px', minWidth: '24px' }}>02:14</span>
          <div style={{ flex: 1, position: 'relative', height: '2.5px', background: 'rgba(255,255,255,0.14)', borderRadius: '3px' }}>
            <div style={{ width: '28%', height: '100%', background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`, borderRadius: '3px' }} />
            <div style={{ position: 'absolute', left: '28%', top: '50%', transform: 'translate(-50%, -50%)', width: '7px', height: '7px', borderRadius: '50%', background: ACCENT_LIGHT }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '7.5px', minWidth: '24px', textAlign: 'right' }}>14:38</span>
        </div>
      </div>
    </div>
  </IPhoneFrame>
);

// ─── iPhone 3: Progresso ───────────────────────────────────────────────────────

const ProgressMockup = ({ rotate = 0 }: { rotate?: number }) => (
  <IPhoneFrame rotate={rotate}>
    <div style={{ background: 'linear-gradient(180deg, #080818 0%, #0C0B24 100%)', padding: '6px 12px 14px', height: '100%', boxSizing: 'border-box' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>Seu Progresso</p>
      <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>6 de 7 noites</p>

      {/* Grid de thumbnails */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', marginBottom: '12px' }}>
        {[1,2,3,4,5,6,7].map(d => (
          <div key={d} style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '8px', overflow: 'hidden', aspectRatio: '1',
              background: `linear-gradient(135deg, hsl(${240+d*8},60%,${d<=6?26:14}%) 0%, hsl(${260+d*8},70%,${d<=6?16:10}%) 100%)`,
              border: d<=6 ? `1.5px solid rgba(107,79,187,0.45)` : '1.5px solid rgba(255,255,255,0.07)',
              opacity: d<=6 ? 1 : 0.3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={d<=6?ACCENT_LIGHT:'rgba(255,255,255,0.3)'}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </div>
            {d<=6 && (
              <div style={{ position: 'absolute', top: '2px', right: '2px', width: '13px', height: '13px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
            )}
            <p style={{ color: d<=6?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.2)', fontSize: '7.5px', textAlign: 'center', margin: '2px 0 0' }}>N{d}</p>
          </div>
        ))}
        <div/>
      </div>

      {/* Barra de progresso geral */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>Progresso geral</span>
          <span style={{ color: ACCENT_LIGHT, fontSize: '9px', fontWeight: 700 }}>86%</span>
        </div>
        <div style={{ width: '100%', height: '3.5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
          <div style={{ width: '86%', height: '100%', background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`, borderRadius: '4px' }} />
        </div>
      </div>

      {/* Próxima sessão */}
      <div style={{ padding: '9px 10px', background: 'rgba(107,79,187,0.12)', borderRadius: '11px', border: `1px solid rgba(107,79,187,0.28)`, display: 'flex', alignItems: 'center', gap: '9px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: `linear-gradient(135deg, hsl(296,60%,26%) 0%, hsl(296,70%,16%) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={ACCENT_LIGHT}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '7.5px', margin: '0 0 2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Próxima noite</p>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '10px', margin: 0 }}>Noite 7 · Consolidação do Padrão</p>
        </div>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 3px 10px rgba(107,79,187,0.45)` }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>

      {/* Streak badge */}
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px' }}>
        <span style={{ fontSize: '12px' }}>🌙</span>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '9px' }}>6 noites consecutivas</span>
      </div>
    </div>
  </IPhoneFrame>
);

// ─── Section ───────────────────────────────────────────────────────────────────

function AppPreview() {
  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-[680px] mx-auto text-center mb-14 reveal">
        <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4">O aplicativo</p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Escolha a noite.<br />
          <em className="italic text-accent">Ouça. Avance.</em>
        </h2>
        <p className="text-ink-light text-base leading-relaxed max-w-[460px] mx-auto">
          Acesso imediato após o pagamento. Uma sessão por noite, na sequência certa —
          direto no seu celular, sem instalar nada.
        </p>
      </div>

      {/* 3 iPhones desktop / 1 iPhone mobile */}
      <div className="flex items-end justify-center gap-3 md:gap-5 reveal" style={{ minHeight: '480px' }}>

        {/* iPhone 1 — Lista (só desktop) */}
        <div className="hidden md:block" style={{ marginBottom: '0px' }}>
          <SessionListMockup rotate={2} />
          <p className="text-center text-sm text-ink-light mt-4 font-medium max-w-[210px] mx-auto leading-snug">Veja o protocolo completo. Comece pela Noite 1.</p>
        </div>

        {/* iPhone 2 — Player (sempre visível, ligeiramente elevado) */}
        <div style={{ marginBottom: '24px' }}>
          <PlayerMockup rotate={0} />
          <p className="text-center text-sm text-ink-light mt-4 font-medium max-w-[210px] mx-auto leading-snug">Áudio guiado de 5 min. Você só precisa ouvir.</p>
        </div>

        {/* iPhone 3 — Progresso (só desktop) */}
        <div className="hidden md:block">
          <ProgressMockup rotate={-2} />
          <p className="text-center text-sm text-ink-light mt-4 font-medium max-w-[210px] mx-auto leading-snug">Cada noite desbloqueada. Progresso visível.</p>
        </div>

      </div>
    </section>
  );
}

export default AppPreview;
