import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ServiceCard } from '../../components/client/ServiceCard';
import { useServiceStore } from '../../../application/store/serviceStore';
import { WHATSAPP_DISPLAY, openWhatsApp } from '../../../lib/whatsapp';

const categories = [
  { id: 'tous', label: 'Tous les services' },
  { id: 'audit', label: 'Audit & expertise' },
  { id: 'vente', label: 'Vente' },
  { id: 'gestion', label: 'Gestion & accompagnement' },
] as const;

export function ClientServicesPage() {
  const { services, charger, loading } = useServiceStore();
  const [cat, setCat] = useState<string>('tous');

  useEffect(() => { void charger(false); }, [charger]);

  const filtered = useMemo(
    () => (cat === 'tous' ? services : services.filter((s) => s.categorie === cat)),
    [services, cat],
  );

  return (
    <ClientLayout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-info/5">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> {services.length} services disponibles
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold max-w-3xl">
            Nos services immobiliers <span className="text-primary">de A à Z</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Audit foncier, bornage, vente, gestion : nos experts vous accompagnent à chaque étape.
            Cliquez sur un service pour discuter directement avec nous sur WhatsApp.
          </p>
          <button
            onClick={() => openWhatsApp('Bonjour ImmoPro, je souhaite être conseillé(e) sur vos services.')}
            className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-success text-white font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={16} /> Contacter sur WhatsApp
          </button>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                cat === c.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-accent'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted-foreground mb-4">Chargement des services…</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className="animate-fade-in"><ServiceCard service={s} /></div>
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">Aucun service dans cette catégorie.</p>
        )}
      </section>

      <section className="max-w-[1400px] mx-auto px-6 pb-16">
        <div className="rounded-2xl bg-card border border-border p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold">Besoin d&apos;un service sur mesure ?</h3>
            <p className="text-muted-foreground mt-2">Notre équipe répond à toutes vos demandes spécifiques.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:+${WHATSAPP_DISPLAY.replace(/\s/g, '').replace('+', '')}`}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border hover:bg-accent font-medium">
              <Phone size={16} /> {WHATSAPP_DISPLAY}
            </a>
            <button
              onClick={() => openWhatsApp('Bonjour ImmoPro, j\'ai une demande personnalisée.')}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-success text-white font-medium hover:opacity-90"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
}
