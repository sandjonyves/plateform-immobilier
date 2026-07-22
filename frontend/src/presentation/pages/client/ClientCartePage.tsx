import { useEffect, useMemo, useState } from 'react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { CesiumMap, type ParcelleMarker } from '../../components/map/CesiumMap';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { Link } from '@tanstack/react-router';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { BedDouble, Building2, Maximize2, Home, MapPin } from 'lucide-react';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

export function ClientCartePage() {
  const terrains = useTerrainStore((s) => s.terrains);
  const maisons = useMaisonStore((s) => s.maisons);
  const chargerT = useTerrainStore((s) => s.charger);
  const chargerM = useMaisonStore((s) => s.charger);
  useEffect(() => { chargerT(); chargerM(); }, [chargerT, chargerM]);

  const [filter, setFilter] = useState<'tous' | 'terrains' | 'maisons'>('tous');
  const [selected, setSelected] = useState<string | null>(null);

  const parcelles = useMemo<ParcelleMarker[]>(() => [
    ...(filter !== 'maisons'
      ? terrains.map((t) => ({
          id: t.id,
          titre: t.titre,
          type: 'terrain' as const,
          statut: t.statut,
          quartier: t.quartier,
          ville: t.ville,
          prix: t.prix,
          bornes: t.bornes,
          surface_m2: t.surface_m2,
        }))
      : []),
    ...(filter !== 'terrains'
      ? maisons.map((m) => ({
          id: m.id,
          titre: m.titre,
          type: 'maison' as const,
          statut: m.statut,
          quartier: m.quartier,
          ville: m.ville,
          prix: m.prix,
          point: m.localisation,
          surface_m2: m.surface_m2,
          chambres: m.chambres,
          etages: m.etages,
          typeBien: m.type,
          salles_de_bain: m.salles_de_bain,
        }))
      : []),
  ], [terrains, maisons, filter]);

  const selectedTerrain = selected ? terrains.find((t) => t.id === selected) : null;
  const selectedMaison = selected ? maisons.find((m) => m.id === selected) : null;
  const selectedItem = selectedTerrain ?? selectedMaison;
  const isTerrain = !!selectedTerrain;

  return (
    <ClientLayout>
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Carte 3D interactive</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Explorez les terrains (polygones) et maisons (bâtiments 3D) sur le globe.
            </p>
          </div>
          <div className="inline-flex bg-card border border-border rounded-lg p-1 text-sm self-start">
            {(['tous', 'terrains', 'maisons'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelected(null); }}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-4">
          <div className="h-[calc(100vh-200px)] min-h-[560px] rounded-xl overflow-hidden border border-border bg-card shadow-sm">
            <CesiumMap
              parcelles={parcelles}
              selectedId={selected}
              onSelect={setSelected}
              hauteurExtrusion={28}
              showOverlay={false}
            />
          </div>

          <aside className="bg-card border border-border rounded-xl flex flex-col max-h-[calc(100vh-200px)] min-h-[560px] overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold">Biens sur la carte</h3>
              <p className="text-xs text-muted-foreground">{parcelles.length} visible(s)</p>
            </div>

            {selectedItem ? (
              <div className="p-5 border-b border-border space-y-3 bg-secondary/30">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {isTerrain ? <MapPin size={12} /> : <Home size={12} />}
                  {isTerrain ? 'Terrain' : 'Maison'}
                  {!isTerrain && selectedMaison && (
                    <span className="normal-case tracking-normal text-foreground/70">· {selectedMaison.type}</span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold leading-tight">{selectedItem.titre}</h3>
                <div className="text-sm text-muted-foreground">{selectedItem.quartier}, {selectedItem.ville}</div>
                <StatusBadge statut={selectedItem.statut} />
                <div className="font-display text-2xl font-bold text-primary">{xaf(selectedItem.prix)}</div>

                {selectedMaison && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="rounded-lg bg-card border border-border px-2 py-2 text-center">
                      <Maximize2 size={12} className="mx-auto text-muted-foreground mb-0.5" />
                      <div className="text-xs font-semibold">{selectedMaison.surface_m2} m²</div>
                    </div>
                    <div className="rounded-lg bg-card border border-border px-2 py-2 text-center">
                      <BedDouble size={12} className="mx-auto text-muted-foreground mb-0.5" />
                      <div className="text-xs font-semibold">{selectedMaison.chambres} ch.</div>
                    </div>
                    <div className="rounded-lg bg-card border border-border px-2 py-2 text-center">
                      <Building2 size={12} className="mx-auto text-muted-foreground mb-0.5" />
                      <div className="text-xs font-semibold">{selectedMaison.etages} ét.</div>
                    </div>
                  </div>
                )}

                {selectedTerrain && (
                  <div className="text-xs text-muted-foreground">
                    Surface estimée : {selectedTerrain.surface_m2.toLocaleString('fr-FR')} m² · {selectedTerrain.bornes.length} bornes GPS
                  </div>
                )}

                <Link
                  to={isTerrain ? '/client/terrains/$id' : '/client/maisons/$id'}
                  params={{ id: selectedItem.id }}
                  className="inline-flex w-full items-center justify-center h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                >
                  Voir les détails
                </Link>
              </div>
            ) : (
              <div className="p-5 border-b border-border text-sm text-muted-foreground text-center">
                Cliquez sur un bâtiment ou une parcelle pour afficher les détails.
              </div>
            )}

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {parcelles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`w-full text-left p-3 hover:bg-secondary/60 transition-colors ${
                    selected === p.id ? 'bg-secondary/80' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {p.type === 'terrain'
                      ? <MapPin size={13} className="text-success shrink-0" />
                      : <Home size={13} className="text-primary shrink-0" />}
                    <span className="text-sm font-medium truncate">{p.titre}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-5">{p.quartier}, {p.ville}</div>
                  <div className="pl-5 text-xs font-medium text-primary mt-0.5">{xaf(p.prix)}</div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </ClientLayout>
  );
}
