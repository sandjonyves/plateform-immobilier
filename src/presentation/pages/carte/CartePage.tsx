import { useEffect, useMemo, useState } from 'react';
import { MapPin, Home, Layers, Maximize2, Search, Globe, Map as MapIcon } from 'lucide-react';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CesiumMap, type ParcelleMarker } from '../../components/map/CesiumMap';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

interface Marker { id: string; titre: string; type: 'terrain' | 'maison'; lat: number; lng: number; statut: string; quartier: string; ville: string; prix: number; }

export function CartePage() {
  const { terrains, charger: cT } = useTerrainStore();
  const { maisons, charger: cM } = useMaisonStore();
  const [q, setQ] = useState('');
  const [layer, setLayer] = useState<'tous' | 'terrain' | 'maison'>('tous');
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'2d' | '3d'>('3d');

  useEffect(() => { cT(); cM(); }, [cT, cM]);

  const markers = useMemo<Marker[]>(() => {
    const tm: Marker[] = terrains.map(t => ({
      id: 't-' + t.id, titre: t.titre, type: 'terrain',
      lat: t.bornes[0].latitude, lng: t.bornes[0].longitude,
      statut: t.statut, quartier: t.quartier, ville: t.ville, prix: t.prix,
    }));
    const mm: Marker[] = maisons.map(m => ({
      id: 'm-' + m.id, titre: m.titre, type: 'maison',
      lat: m.localisation.latitude, lng: m.localisation.longitude,
      statut: m.statut, quartier: m.quartier, ville: m.ville, prix: m.prix,
    }));
    return [...tm, ...mm].filter(x =>
      (layer === 'tous' || x.type === layer) &&
      (q === '' || x.titre.toLowerCase().includes(q.toLowerCase()) || x.quartier.toLowerCase().includes(q.toLowerCase())),
    );
  }, [terrains, maisons, q, layer]);

  const parcelles = useMemo<ParcelleMarker[]>(() => {
    const tm: ParcelleMarker[] = terrains
      .filter(t => layer === 'tous' || layer === 'terrain')
      .filter(t => q === '' || t.titre.toLowerCase().includes(q.toLowerCase()) || t.quartier.toLowerCase().includes(q.toLowerCase()))
      .map(t => ({
        id: 't-' + t.id, titre: t.titre, type: 'terrain' as const,
        statut: t.statut, quartier: t.quartier, ville: t.ville, prix: t.prix,
        bornes: t.bornes,
      }));
    const mm: ParcelleMarker[] = maisons
      .filter(m => layer === 'tous' || layer === 'maison')
      .filter(m => q === '' || m.titre.toLowerCase().includes(q.toLowerCase()) || m.quartier.toLowerCase().includes(q.toLowerCase()))
      .map(m => ({
        id: 'm-' + m.id, titre: m.titre, type: 'maison' as const,
        statut: m.statut, quartier: m.quartier, ville: m.ville, prix: m.prix,
        point: m.localisation,
      }));
    return [...tm, ...mm];
  }, [terrains, maisons, q, layer]);

  // Compute bounding box for projection
  const bbox = useMemo(() => {
    if (markers.length === 0) return { minLat: 3.8, maxLat: 5.5, minLng: 9.5, maxLng: 11.6 };
    const lats = markers.map(m => m.lat), lngs = markers.map(m => m.lng);
    return {
      minLat: Math.min(...lats) - 0.05, maxLat: Math.max(...lats) + 0.05,
      minLng: Math.min(...lngs) - 0.05, maxLng: Math.max(...lngs) + 0.05,
    };
  }, [markers]);

  const project = (lat: number, lng: number) => ({
    x: ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * 100,
    y: 100 - ((lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Carte globale"
        sous_titre="Visualisez l'ensemble de votre portefeuille géolocalisé — Cameroun"
        actions={
          <button className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary flex items-center gap-1.5">
            <Maximize2 size={15} /> Plein écran
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher sur la carte…"
                className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background" />
            </div>
            <div className="flex bg-secondary rounded-lg p-0.5">
              {(['tous', 'terrain', 'maison'] as const).map(k => (
                <button key={k} onClick={() => setLayer(k)}
                  className={`h-7 px-3 text-xs rounded-md transition-colors ${layer === k ? 'bg-card shadow-sm font-medium' : 'text-muted-foreground'}`}>
                  {k === 'tous' ? 'Tout' : k === 'terrain' ? 'Terrains' : 'Maisons'}
                </button>
              ))}
            </div>
            <button className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-secondary flex items-center justify-center">
              <Layers size={15} />
            </button>
          </div>

          <div className="relative aspect-[4/3] bg-gradient-to-br from-success/5 via-info/5 to-primary/10 overflow-hidden">
            {/* Decorative grid */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Decorative blobs simulating cities */}
            <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-success/15 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />

            {/* Markers */}
            {markers.map((m) => {
              const { x, y } = project(m.lat, m.lng);
              const isSel = selected === m.id;
              const Icon = m.type === 'terrain' ? MapPin : Home;
              const color = m.type === 'terrain' ? 'bg-success' : 'bg-primary';
              return (
                <button key={m.id} onClick={() => setSelected(m.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className={`absolute inset-0 ${color} rounded-full opacity-30 animate-ping`} style={{ animationDuration: '2.5s' }} />
                  <span className={`relative flex items-center justify-center w-8 h-8 rounded-full ${color} text-white shadow-lg ring-2 ring-card transition-transform ${isSel ? 'scale-125' : 'group-hover:scale-110'}`}>
                    <Icon size={14} />
                  </span>
                  {isSel && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-popover border border-border rounded-lg shadow-xl p-3 text-left z-10">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-medium text-sm leading-tight">{m.titre}</div>
                        <StatusBadge statut={m.statut} />
                      </div>
                      <div className="text-xs text-muted-foreground">{m.quartier}, {m.ville}</div>
                      <div className="text-xs font-display font-bold text-primary mt-1">{xaf(m.prix)}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-1">
                        {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-card/80 backdrop-blur px-2 py-1 rounded">
              {markers.length} repère(s) · projection équirectangulaire
            </div>
          </div>
        </div>

        <aside className="bg-card border border-border rounded-xl flex flex-col max-h-[640px]">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold">Liste des biens</h3>
            <p className="text-xs text-muted-foreground">{markers.length} résultats</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {markers.map((m) => (
              <button key={m.id} onClick={() => setSelected(m.id)}
                className={`w-full text-left p-3 hover:bg-secondary/60 transition-colors ${selected === m.id ? 'bg-secondary/80' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  {m.type === 'terrain' ? <MapPin size={13} className="text-success" /> : <Home size={13} className="text-primary" />}
                  <span className="text-sm font-medium truncate flex-1">{m.titre}</span>
                </div>
                <div className="text-xs text-muted-foreground">{m.quartier}, {m.ville}</div>
                <div className="text-xs font-medium text-primary mt-0.5">{xaf(m.prix)}</div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
