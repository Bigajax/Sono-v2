function Problem() {
  return (
    <section className="py-28 px-6 bg-cream">
      <div className="max-w-[520px] mx-auto text-center reveal">

        <div className="flex items-center gap-4 justify-center mb-10">
          <div className="h-px w-8 bg-accent/25" />
          <p className="text-[10px] tracking-[0.28em] uppercase text-accent" style={{ fontWeight: 400 }}>
            O que está acontecendo
          </p>
          <div className="h-px w-8 bg-accent/25" />
        </div>

        <h2
          className="font-serif font-light leading-[1.08] mb-2 tracking-tight"
          style={{ fontSize: 'clamp(28px, 6.5vw, 46px)', color: '#12121E' }}
        >
          Você não tem dificuldade<br />
          para dormir.
        </h2>

        <h2
          className="font-serif font-light leading-[1.08] mb-10 italic tracking-tight"
          style={{ fontSize: 'clamp(28px, 6.5vw, 46px)', color: '#6B4FBB' }}
        >
          Você tem dificuldade<br />
          para desligar.
        </h2>

        <div className="w-10 h-px mx-auto mb-10 bg-ink/10" />

        <p
          className="leading-loose mb-6"
          style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', color: '#6E6B85' }}
        >
          Seu corpo está cansado.<br />
          Mas sua mente continua em alerta.
        </p>

        <p
          className="font-serif font-light italic"
          style={{ fontSize: 'clamp(16px, 3.8vw, 20px)', color: 'rgba(18,18,30,0.32)', lineHeight: 1.65 }}
        >
          E quanto mais você tenta forçar o sono…<br />
          mais acordado você fica.
        </p>

        <div className="w-10 h-px mx-auto mt-10 mb-10 bg-ink/10" />

        <p style={{ fontSize: 'clamp(14px, 3.2vw, 16px)', color: '#6E6B85', lineHeight: 1.85 }}>
          E no dia seguinte você levanta destruído.<br />
          Trabalha no limite. Chega em casa exausto.<br />
          Deita de novo achando que dessa vez vai funcionar.
        </p>

        <p
          className="font-serif font-light italic mt-8"
          style={{ fontSize: 'clamp(18px, 4.5vw, 24px)', color: 'rgba(18,18,30,0.55)', lineHeight: 1.5 }}
        >
          E o ciclo se repete.<br />
          <span style={{ color: 'rgba(18,18,30,0.28)', fontSize: '0.85em' }}>Desde quando você nem lembra.</span>
        </p>

      </div>
    </section>
  );
}

export default Problem;
