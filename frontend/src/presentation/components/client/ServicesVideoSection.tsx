import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import heroVideo from '@/assets/hero-services.mp4.asset.json';
import heroMaison from '@/assets/hero-maison.jpg';

export function ServicesVideoSection() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const toggleMute = () => {
    const v = ref.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-2 space-y-5 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Découvrir ImmoPro
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            L'immobilier camerounais réinventé en vidéo
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Survolez nos terrains, explorez nos maisons et découvrez nos services d'audit en quelques secondes.
            Une expérience visuelle inédite, conçue pour les acheteurs exigeants.
          </p>
          <ul className="space-y-2 text-sm">
            {['Visite aérienne des biens', 'Visualisation  intégrée', 'Audit certifié par nos experts'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden shadow-2xl group ring-1 ring-border">
          <video
            ref={ref}
            src={heroVideo.url}
            poster={heroMaison}
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-video object-cover bg-black"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center transition-colors"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
