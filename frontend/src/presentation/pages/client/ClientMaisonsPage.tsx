import { useEffect, useMemo, useState } from 'react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { PropertyCard } from '../../components/client/PropertyCard';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { useVilleStore } from '../../../application/store/villeStore';
import { Search } from 'lucide-react';

export function ClientMaisonsPage() {
  const maisons = useMaisonStore((s) => s.maisons);
  const charger = useMaisonStore((s) => s.charger);
  const { villes, charger: chargerVilles } = useVilleStore();
  useEffect(() => { charger(); chargerVilles(); }, [charger, chargerVilles]);

  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [ville, setVille] = useState('all');

  const types = useMemo(() => Array.from(new Set(maisons.map((m) => m.type))), [maisons]);

  const list = maisons.filter((m) =>
    (type === 'all' || m.type === type) &&
    (ville === 'all' || m.ville === ville) &&
    (q === '' || (m.titre + ' ' + m.quartier + ' ' + m.ville).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <ClientLayout>
      <section className="border-b border-border bg-card/40">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <h1 className="font-display text-4xl font-bold">Maisons & appartements</h1>
          <p className="text-muted-foreground mt-2">{maisons.length} biens — villas, duplex, appartements et bureaux.</p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3">
            <Search size={16} className="text-muted-foreground"/>
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une maison…"
              className="flex-1 bg-transparent outline-none text-sm py-2.5"
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="border border-border rounded-lg px-3 py-2.5 text-sm bg-background capitalize">
            <option value="all">Tous les types</option>
            {types.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select value={ville} onChange={(e) => setVille(e.target.value)}
            className="border border-border rounded-lg px-3 py-2.5 text-sm bg-background">
            <option value="all">Toutes les villes</option>
            {villes.map((v) => <option key={v.id} value={v.nom}>{v.nom}</option>)}
          </select>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <PropertyCard
              key={m.id} type="maison" id={m.id}
              titre={m.titre} ville={m.ville} quartier={m.quartier}
              prix={m.prix} statut={m.statut} surface_m2={m.surface_m2}
              typeMaison={m.type} chambres={m.chambres} salles_de_bain={m.salles_de_bain}
            />
          ))}
        </div>
        {list.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">Aucune maison ne correspond à votre recherche.</div>
        )}
      </section>
    </ClientLayout>
  );
}
