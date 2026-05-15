const testimonials = [
  {
    quote: "Dormi em 10 minutos pela primeira vez em meses. Fui dormir achando que não ia funcionar e acordei assustada com o alarme.",
    name: "Mariana R.",
    detail: "1ª noite do protocolo",
  },
  {
    quote: "Toda noite a cabeça disparava com mil coisas. Na terceira noite consegui dormir sem ruminar pela primeira vez em muito tempo.",
    name: "Felipe A.",
    detail: "3ª noite do protocolo",
  },
  {
    quote: "Já tinha tentado meditação antes e nunca funcionou. Isso é diferente porque é progressivo. Na última noite dormi de um fôlego pela primeira vez em anos.",
    name: "Camila S.",
    detail: "7ª noite do protocolo",
  },
  {
    quote: "Acordava toda madrugada e não voltava a dormir de jeito nenhum. Depois de uma semana isso praticamente sumiu.",
    name: "Ana B.",
    detail: "Após 7 noites",
  },
  {
    quote: "Antes demorava tipo 1h pra pegar no sono. Agora uns 15 minutos. Diferença enorme pra mim.",
    name: "Ricardo P.",
    detail: "Após 7 noites",
  },
  {
    quote: "O exercício de respiração da noite 2 foi divisor de águas. Antes ficava no celular até 1h sem sono, ontem fechei o olho às 22h.",
    name: "Lucas M.",
    detail: "2ª noite do protocolo",
  },
];

function TestimonialCard({ quote, name, detail }: typeof testimonials[0]) {
  return (
    <div
      className="reveal"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div
        className="font-serif"
        style={{ fontSize: '48px', lineHeight: 0.8, color: 'rgba(157,151,204,0.22)', fontStyle: 'italic', userSelect: 'none' }}
      >
        "
      </div>

      <p
        className="font-serif font-light italic leading-relaxed flex-1"
        style={{ fontSize: 'clamp(15px, 3.2vw, 17px)', color: 'rgba(255,255,255,0.78)', letterSpacing: '0.01em' }}
      >
        {quote}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '20px', height: '1px', background: 'rgba(196,145,60,.4)' }} />
        <div>
          <p style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
            {name}
          </p>
          <p style={{ fontSize: '10px', color: 'rgba(157,151,204,0.5)', letterSpacing: '0.08em', fontWeight: 300, marginTop: '2px' }}>
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function Reviews() {
  return (
    <section className="py-28 px-6" style={{ background: '#08090F' }}>
      <div className="text-center mb-16 reveal">
        <div className="flex items-center gap-4 justify-center mb-4">
          <div className="h-px w-8" style={{ background: 'rgba(157,151,204,0.2)' }} />
          <p style={{ color: 'rgba(157,151,204,.45)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 400 }}>
            Resultados reais
          </p>
          <div className="h-px w-8" style={{ background: 'rgba(157,151,204,0.2)' }} />
        </div>
        <p className="font-serif font-light" style={{ fontSize: 'clamp(52px, 12vw, 80px)', color: '#FDFBFF', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
          +1.800
        </p>
        <p className="mt-3 font-light max-w-[320px] mx-auto" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.03em', lineHeight: 1.65 }}>
          pessoas já testaram esse protocolo<br />
          para acalmar a mente antes de dormir
        </p>
      </div>

      <div className="max-w-[1020px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>

      <p className="text-center mt-10 font-light" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em' }}>
        DEPOIMENTOS REAIS DA COMUNIDADE · NOMES ABREVIADOS POR PRIVACIDADE
      </p>
    </section>
  );
}

export default Reviews;
