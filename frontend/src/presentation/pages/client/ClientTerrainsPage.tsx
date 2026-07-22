import { useEffect, useState } from 'react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { PropertyCard } from '../../components/client/PropertyCard';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useVilleStore } from '../../../application/store/villeStore';
import { Search, SlidersHorizontal } from 'lucide-react';

export function ClientTerrainsPage() {
  const terrains = useTerrainStore((s) => s.terrains);
  const charger = useTerrainStore((s) => s.charger);
  const { villes, charger: chargerVilles } = useVilleStore();
  useEffect(() => { charger(); chargerVilles(); }, [charger, chargerVilles]);

  const [q, setQ] = useState('');
  const [ville, setVille] = useState('all');
  const [prixMax, setPrixMax] = useState<number>(500_000_000);

  const list = terrains.filter((t) =>
    (ville === 'all' || t.ville === ville) &&
    t.prix <= prixMax &&
    (q === '' || (t.titre + ' ' + t.quartier + ' ' + t.ville).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <ClientLayout>
      <section className="border-b border-border bg-card/40">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <h1 className="font-display text-4xl font-bold">Terrains à vendre</h1>
          <p className="text-muted-foreground mt-2">{terrains.length} parcelles disponibles, bornes GPS et visualisation 3D incluses.</p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3">
            <Search size={16} className="text-muted-foreground"/>
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un terrain, un quartier…"
              className="flex-1 bg-transparent outline-none text-sm py-2.5"
            />
          </div>
          <select
            value={ville} onChange={(e) => setVille(e.target.value)}
            className="border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
          >
            <option value="all">Toutes les villes</option>
            {villes.map((v) => <option key={v.id} value={v.nom}>{v.nom}</option>)}
          </select>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal size={14}/> Prix max : <strong className="text-foreground">{prixMax.toLocaleString('fr-FR')} XAF</strong>
            <input
              type="range" min={10_000_000} max={500_000_000} step={5_000_000}
              value={prixMax} onChange={(e) => setPrixMax(Number(e.target.value))}
              className="w-40 accent-primary"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <PropertyCard
              key={t.id} type="terrain" id={t.id}
              titre={t.titre} ville={t.ville} quartier={t.quartier}
              prix={t.prix} statut={t.statut} surface_m2={t.surface_m2}
              badge="3D"
            />
          ))}
        </div>
        {list.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">Aucun terrain ne correspond à votre recherche.</div>
        )}
      </section>
    </ClientLayout>
  );
}
