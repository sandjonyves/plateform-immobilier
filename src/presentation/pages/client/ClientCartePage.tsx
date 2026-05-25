import { useEffect, useState } from 'react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { CesiumMap, type ParcelleMarker } from '../../components/map/CesiumMap';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { Link } from '@tanstack/react-router';

export function ClientCartePage() {
  const terrains = useTerrainStore((s) => s.terrains);
  const maisons = useMaisonStore((s) => s.maisons);
  const chargerT = useTerrainStore((s) => s.charger);
  const chargerM = useMaisonStore((s) => s.charger);
  useEffect(() => { chargerT(); chargerM(); }, [chargerT, chargerM]);

  const [filter, setFilter] = useState<'tous' | 'terrains' | 'maisons'>('tous');
  const [selected, setSelected] = useState<string | null>(null);

  const parcelles: ParcelleMarker[] = [
    ...(filter !== 'maisons'
      ? terrains.map((t) => ({
          id: t.id, titre: t.titre, type: 'terrain' as const,
          statut: t.statut, quartier: t.quartier, ville: t.ville,
          prix: t.prix, bornes: t.bornes,
        })) : []),
    ...(filter !== 'terrains'
      ? maisons.map((m) => ({
          id: m.id, titre: m.titre, type: 'maison' as const,
          statut: m.statut, quartier: m.quartier, ville: m.ville,
          prix: m.prix, point: m.localisation,
        })) : []),
  ];

  const selectedItem = selected
    ? terrains.find((t) => t.id === selected) ?? maisons.find((m) => m.id === selected)
    : null;
  const isTerrain = selectedItem && terrains.some((t) => t.id === selectedItem.id);

  return (
    <ClientLayout>
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Carte 3D interactive</h1>
            <p className="text-sm text-muted-foreground mt-1">Explorez les terrains et maisons sur le globe en 3D.</p>
          </div>
          <div className="inline-flex bg-card border border-border rounded-lg p-1 text-sm">
            {(['tous', 'terrains', 'maisons'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="h-[calc(100vh-220px)] min-h-[520px] rounded-xl overflow-hidden border border-border bg-card">
            <CesiumMap parcelles={parcelles} hauteurExtrusion={25} onSelect={setSelected} />
          </div>
          <aside className="bg-card border border-border rounded-xl p-5 h-fit lg:sticky lg:top-24">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{isTerrain ? 'Terrain' : 'Maison'}</div>
                <h3 className="font-display text-xl font-bold leading-tight">{selectedItem.titre}</h3>
                <div className="text-sm text-muted-foreground">{selectedItem.quartier}, {selectedItem.ville}</div>
                <div className="font-display text-2xl font-bold text-primary">
                  {selectedItem.prix.toLocaleString('fr-FR')} XAF
                </div>
                <Link
                  to={isTerrain ? `/client/terrains/${selectedItem.id}` : `/client/maisons/${selectedItem.id}`}
                  className="inline-flex w-full items-center justify-center h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  Voir les détails
                </Link>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Cliquez sur une parcelle ou un marqueur pour voir les détails.
              </div>
            )}
          </aside>
        </div>
      </div>
    </ClientLayout>
  );
}
