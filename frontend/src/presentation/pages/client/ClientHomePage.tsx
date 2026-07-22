import { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, ShieldCheck, Globe2, ArrowRight, Award, Users, Building2, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { PropertyCard } from '../../components/client/PropertyCard';
import { HeroSlider } from '../../components/client/HeroSlider';
import { ServicesVideoSection } from '../../components/client/ServicesVideoSection';
import { ServiceCard } from '../../components/client/ServiceCard';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { useServiceStore } from '../../../application/store/serviceStore';
import { openWhatsApp } from '../../../lib/whatsapp';

export function ClientHomePage() {
  const navigate = useNavigate();
  const terrains = useTerrainStore((s) => s.terrains);
  const maisons = useMaisonStore((s) => s.maisons);
  const chargerT = useTerrainStore((s) => s.charger);
  const chargerM = useMaisonStore((s) => s.charger);
  const { services, charger: chargerS } = useServiceStore();

  useEffect(() => { chargerT(); chargerM(); void chargerS(false); }, [chargerT, chargerM, chargerS]);

  const terrainsDispo = terrains.filter((t) => t.statut === 'disponible').slice(0, 3);
  const maisonsDispo = maisons.filter((m) => m.statut === 'disponible').slice(0, 3);
  const servicesPhares = (services.filter((s) => s.phare).length
    ? services.filter((s) => s.phare)
    : services
  ).slice(0, 6);

  return (
    <ClientLayout>
      {/* HERO SLIDER */}
      <HeroSlider />

      {/* RECHERCHE RAPIDE */}
      <section className="max-w-[1400px] mx-auto px-6 -mt-14 relative z-10">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-4">
            <Search size={18} className="text-muted-foreground" />
            <input
              placeholder="Quartier, ville, type de bien…"
              className="flex-1 bg-transparent outline-none text-sm py-3"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate({ to: '/client/terrains' }); }}
            />
          </div>
          <button onClick={() => navigate({ to: '/client/terrains' })}
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-border hover:bg-accent font-medium text-sm">
            <MapPin size={15} /> Terrains
          </button>
          <button onClick={() => navigate({ to: '/client/maisons' })}
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-border hover:bg-accent font-medium text-sm">
            <Building2 size={15} /> Maisons
          </button>
          <button onClick={() => navigate({ to: '/client/services' })}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90">
            Rechercher <ArrowRight size={16} />
          </button>
        </div>

        {/* KPI strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Building2, num: `${terrains.length + maisons.length}+`, label: 'Biens vérifiés' },
            { icon: Users, num: '1 200+', label: 'Clients satisfaits' },
            { icon: Award, num: '10 ans', label: "d'expertise" },
            { icon: Globe2, num: '3D', label: 'Visualisation ' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <s.icon size={18} />
              </div>
              <div>
                <div className="font-display text-xl font-bold">{s.num}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles size={14} /> Nos services
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Tout pour réussir votre projet immobilier</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">Cliquez sur un service pour démarrer une discussion sur WhatsApp avec nos experts.</p>
          </div>
          <Link to="/client/services" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            Tous les services <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicesPhares.map((s) => (
            <div key={s.id} className="animate-fade-in"><ServiceCard service={s} /></div>
          ))}
        </div>
      </section>

      {/* VIDEO SECTION */}
      <div className="border-y border-border bg-card/40">
        <ServicesVideoSection />
      </div>

      {/* TERRAINS */}
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
            <PropertyCard key={t.id} type="terrain" id={t.id} titre={t.titre} ville={t.ville}
              quartier={t.quartier} prix={t.prix} statut={t.statut} surface_m2={t.surface_m2} badge="3D" />
          ))}
        </div>
      </section>

      {/* MAISONS */}
      <section className="bg-card/40 border-y border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold">Maisons en vedette</h2>
              <p className="text-muted-foreground mt-1">Villas, duplex et appartements sélectionnés.</p>
            </div>
            <Link to="/client/maisons" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {maisonsDispo.map((m) => (
              <PropertyCard key={m.id} type="maison" id={m.id} titre={m.titre} ville={m.ville}
                quartier={m.quartier} prix={m.prix} statut={m.statut} surface_m2={m.surface_m2}
                typeMaison={m.type} chambres={m.chambres} salles_de_bain={m.salles_de_bain} />
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI */}
      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Pourquoi nous choisir ?</h2>
          <p className="text-muted-foreground mt-3">Nous mettons la technologie au service de votre sécurité immobilière.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: 'Titres vérifiés', d: "Chaque bien dispose d'un titre foncier authentifié par nos experts." },
            { icon: Globe2, t: 'Visualisation 3D', d: 'Explorez chaque parcelle sur un globe 3D haute résolution.' },
            { icon: Award, t: 'Accompagnement total', d: 'De la visite à la signature, notre équipe vous accompagne.' },
          ].map((c) => (
            <div key={c.t} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <c.icon size={28} className="text-primary mb-4" />
              <h3 className="font-display text-xl font-bold">{c.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-info text-primary-foreground p-10 md:p-14">
          <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -top-20 -left-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <h3 className="font-display text-3xl md:text-4xl font-bold max-w-2xl">
              Prêt à concrétiser votre projet immobilier ?
            </h3>
            <p className="mt-3 text-primary-foreground/85 max-w-xl">
              Discutez directement avec nos experts sur WhatsApp ou explorez notre carte 3D.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => openWhatsApp('Bonjour ImmoPro, je souhaite démarrer un projet immobilier.')}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-foreground font-medium hover:bg-white/90 transition-colors"
              >
                <MessageCircle size={16} /> Discuter sur WhatsApp
              </button>
              <Link to="/client/carte" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/15 backdrop-blur border border-white/25 text-white font-medium hover:bg-white/25 transition-colors">
                Ouvrir la carte 3D <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
}
