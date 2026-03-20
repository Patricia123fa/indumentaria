import { useMemo } from 'react';

export default function Timeline({ historia }) {
  const cards = useMemo(() => {
    return historia.map((siglo, index) => {
      const conflictos = siglo.conflictos;
      const featured = conflictos[0];
      return {
        index,
        sigloTitle: siglo.etiqueta ?? siglo.siglo,
        circuloImagen: siglo.circuloImagen,
        conflictos,
        featured
      };
    });
  }, [historia]);

  return (
    <div className="min-h-screen bg-[#f3ece0] text-[#402315]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.5em] text-amber-500">American Revolution Timeline</p>
        <h1 className="text-4xl font-serif font-semibold tracking-tight text-brown-900">
          Horizontal Infographic
        </h1>
        <div className="relative mt-10 w-full">
          <div className="relative flex items-center justify-between">
            {cards.map((card) => (
              <div key={card.sigloTitle} className="flex flex-1 flex-col items-center gap-4 text-center">
                <span className="text-sm uppercase tracking-[0.4em] text-slate-500">{card.sigloTitle}</span>
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-amber-500 bg-white">
                  {card.circuloImagen && (
                    <img
                      src={card.circuloImagen}
                      alt={card.featured.nombre}
                      className="h-full w-full object-cover object-center"
                    />
                  )}
                </div>
                <p className="text-sm font-semibold">{card.featured.nombre}</p>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 top-1/2 flex justify-between">
            {cards.map((card) => (
              <span key={`${card.sigloTitle}-marker`} className="h-2 w-2 rounded-full bg-amber-500" />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-amber-400" />
        </div>
      </div>
    </div>
  );
}
