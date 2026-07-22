import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import heroTerrain from '@/assets/hero-terrain.jpg';
import heroMaison from '@/assets/hero-maison.jpg';
import heroAudit from '@/assets/hero-audit.jpg';

interface Slide {
  image: string;
  kicker: string;
  titre: string;
  description: string;
  cta: { label: string; to: string };
}

const slides: Slide[] = [
  {
    image: heroTerrain,
    kicker: 'Vente de terrains',
    titre: 'Des terrains bornés, titrés et vérifiés',
    description: "Explorez nos parcelles à Yaoundé, Douala et partout au Cameroun avec visualisation 3D et bornes GPS.",
    cta: { label: 'Voir les terrains', to: '/client/terrains' },
  },
  {
    image: heroMaison,
    kicker: 'Vente de maisons',
    titre: 'Votre nouvelle maison vous attend',
    description: 'Villas, duplex, appartements : un catalogue soigneusement sélectionné avec visites virtuelles.',
    cta: { label: 'Voir les maisons', to: '/client/maisons' },
  },
  {
    image: heroAudit,
    kicker: 'Audit & expertise',
    titre: 'Sécurisez vos investissements immobiliers',
    description: 'Audit foncier, bornage GPS, vérification de titre : nos experts protègent vos achats.',
    cta: { label: 'Découvrir nos services', to: '/client/services' },
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[640px] md:h-[720px] overflow-hidden border-b border-border">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img src={s.image} alt={s.titre} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 w-full">
              <div className={`max-w-2xl text-white ${idx === i ? 'animate-fade-in' : ''}`}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {s.kicker}
                </span>
                <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold leading-[1.05]">{s.titre}</h1>
                <p className="mt-5 text-base md:text-lg text-white/85 max-w-xl">{s.description}</p>
                <Link
                  to={s.cta.to}
                  className="mt-7 inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 hover:gap-3 transition-all"
                >
                  {s.cta.label} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button onClick={prev} aria-label="Précédent"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} aria-label="Suivant"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-colors">
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Aller au slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? 'bg-white w-10' : 'bg-white/50 w-5 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  );
}
