import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, MapPin, ShieldCheck, Globe2, ArrowRight } from 'lucide-react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { PropertyCard } from '../../components/client/PropertyCard';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';

export function ClientHomePage() {
  const terrains = useTerrainStore((s) => s.terrains);
  const maisons = useMaisonStore((s) => s.maisons);
  const chargerT = useTerrainStore((s) => s.charger);
  const chargerM = useMaisonStore((s) => s.charger);

  useEffect(() => { chargerT(); chargerM(); }, [chargerT, chargerM]);

  const terrainsDispo = terrains.filter((t) => t.statut === 'disponible').slice(0, 3);
  const maisonsDispo = maisons.filter((m) => m.statut === 'disponible').slice(0, 3);

  return (
    <ClientLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-info/5 to-transparent" />
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-[1400px] mx-auto px-6 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Plus de {terrains.length + maisons.length} biens vérifiés
          </span>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-bold leading-[1.05] max-w-3xl">
            Trouvez votre <span className="text-primary">terrain</span> ou votre maison de rêve au Cameroun.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            Visualisez chaque parcelle en 3D, étudiez les bornes GPS, le relief et l'environnement avant de vous engager.
          </p>

          <div className="mt-8 bg-card border border-border rounded-2xl shadow-lg p-2 max-w-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-muted-foreground" />
              <input
                placeholder="Quartier, ville, type de bien…"
                className="flex-1 bg-transparent outline-none text-sm py-3"
              />
            </div>
            <Link
              to="/client/terrains"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Rechercher <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl">
            {[
              { icon: Globe2, label: 'Vue 3D Cesium', desc: 'Globe & relief réels' },
              { icon: ShieldCheck, label: 'Titres vérifiés', desc: 'Titre foncier inclus' },
              { icon: MapPin, label: 'Bornes GPS', desc: 'Surface calculée' },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <f.icon size={20} className="text-primary" />
                <div className="text-sm font-semibold">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terrains à la une */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold">Terrains à la une</h2>
            <p className="text-muted-foreground mt-1">Parcelles disponibles, bornées et vérifiées.</p>
          </div>
          <Link to="/client/terrains" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {terrainsDispo.map((t) => (
            <PropertyCard
              key={t.id}
              type="terrain"
              id={t.id}
              titre={t.titre}
              ville={t.ville}
              quartier={t.quartier}
              prix={t.prix}
              statut={t.statut}
              surface_m2={t.surface_m2}
              badge="3D"
            />
          ))}
        </div>
      </section>

      {/* Maisons */}
      <section className="bg-card/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold">Maisons en vedette</h2>
              <p className="text-muted-foreground mt-1">Villas, duplex et appartements soigneusement sélectionnés.</p>
            </div>
            <Link to="/client/maisons" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {maisonsDispo.map((m) => (
              <PropertyCard
                key={m.id}
                type="maison"
                id={m.id}
                titre={m.titre}
                ville={m.ville}
                quartier={m.quartier}
                prix={m.prix}
                statut={m.statut}
                surface_m2={m.surface_m2}
                typeMaison={m.type}
                chambres={m.chambres}
                salles_de_bain={m.salles_de_bain}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-info text-primary-foreground p-10 md:p-14">
          <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <h3 className="font-display text-3xl md:text-4xl font-bold max-w-2xl">
            Explorez le globe 3D et trouvez le terrain parfait
          </h3>
          <p className="mt-3 text-primary-foreground/80 max-w-xl">
            Naviguez sur une carte satellite haute résolution avec relief et bâtiments 3D, alimentée par CesiumJS.
          </p>
          <Link
            to="/client/carte"
            className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-background text-foreground font-medium hover:bg-background/90"
          >
            Ouvrir la carte 3D <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </ClientLayout>
  );
}
