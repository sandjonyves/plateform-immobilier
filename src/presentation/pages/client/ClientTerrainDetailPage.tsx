import { useEffect, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Maximize2, ShieldCheck, Phone, MessageSquare, Calendar, Heart, Share2 } from 'lucide-react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CesiumMap, type ParcelleMarker } from '../../components/map/CesiumMap';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { openWhatsApp } from '../../../lib/whatsapp';
import { terrainCover } from '../../../infrastructure/data/propertyImages';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';
const dateFR = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

export function ClientTerrainDetailPage() {
  const { id } = useParams({ from: '/client/terrains/$id' });
  const terrains = useTerrainStore((s) => s.terrains);
  const charger = useTerrainStore((s) => s.charger);
  useEffect(() => { if (terrains.length === 0) charger(); }, [charger, terrains.length]);

  const [contactOpen, setContactOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const terrain = terrains.find((t) => t.id === id);

  const partager = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title: terrain?.titre, url }); return; } catch { /* annulé */ }
    }
    try { await navigator.clipboard.writeText(url); alert('Lien copié dans le presse-papier'); } catch { /* ignore */ }
  };

  if (!terrain) {
    return (
      <ClientLayout>
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Terrain introuvable</h1>
          <Link to="/client/terrains" className="mt-4 inline-flex text-primary text-sm">← Retour aux terrains</Link>
        </div>
      </ClientLayout>
    );
  }

  const marker: ParcelleMarker = {
    id: terrain.id,
    titre: terrain.titre,
    type: 'terrain',
    statut: terrain.statut,
    quartier: terrain.quartier,
    ville: terrain.ville,
    prix: terrain.prix,
    bornes: terrain.bornes,
  };

  const prixM2 = Math.round(terrain.prix / terrain.surface_m2);

  return (
    <ClientLayout>
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <Link to="/client/terrains" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Retour aux terrains
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge statut={terrain.statut} />
              <span className="text-xs font-semibold uppercase tracking-wide bg-primary/10 text-primary px-2 py-1 rounded">Vue 3D</span>
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">{terrain.titre}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin size={15}/> {terrain.quartier}, {terrain.ville}
            </div>
          </div>

          {/* Cover */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border">
            <img src={terrainCover(terrain.photos)} alt={terrain.titre} className="w-full h-full object-cover" />
          </div>

          {/* 3D Map */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Visualisation 3D de la parcelle</h2>
              <span className="text-xs text-muted-foreground">Cliquez sur la parcelle • survolez les bornes</span>
            </div>
            <div className="relative h-[480px] rounded-xl overflow-hidden border border-border bg-card">
              <CesiumMap parcelles={[marker]} hauteurExtrusion={20} />
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{terrain.description}</p>
          </div>

          {/* Caractéristiques */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Caractéristiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
              <Caract label="Surface" value={`${terrain.surface_m2.toLocaleString('fr-FR')} m²`} icon={<Maximize2 size={14}/>} />
              <Caract label="Prix au m²" value={`${prixM2.toLocaleString('fr-FR')} XAF`} />
              <Caract label="Bornes GPS" value={`${terrain.bornes.length} bornes`} />
              <Caract label="Titre foncier" value={terrain.titre_foncier} icon={<ShieldCheck size={14}/>} />
              <Caract label="Ville" value={terrain.ville} />
              <Caract label="Ajouté le" value={dateFR(terrain.date_ajout)} />
            </div>
          </div>

          {/* Bornes GPS détaillées */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">Bornes GPS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-2 font-medium">Borne</th>
                    <th className="text-left py-2 font-medium">Latitude</th>
                    <th className="text-left py-2 font-medium">Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  {terrain.bornes.map((b, i) => (
                    <tr key={i} className="border-b border-border/60 last:border-0">
                      <td className="py-2 font-medium">B{i + 1}</td>
                      <td className="py-2 font-mono text-xs">{b.latitude.toFixed(6)}</td>
                      <td className="py-2 font-mono text-xs">{b.longitude.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar : prix + contact */}
        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <div className="text-xs text-muted-foreground">Prix</div>
            <div className="font-display text-3xl font-bold text-primary mt-1">{xaf(terrain.prix)}</div>
            <div className="text-xs text-muted-foreground mt-1">{prixM2.toLocaleString('fr-FR')} XAF / m²</div>

            <div className="my-5 h-px bg-border" />

            <button
              onClick={() => setContactOpen((v) => !v)}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              <Phone size={15}/> Contacter l'agent
            </button>
            <button className="mt-2 w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-border hover:bg-accent text-sm font-medium">
              <Calendar size={15}/> Planifier une visite
            </button>
            <button className="mt-2 w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg border border-border hover:bg-accent text-sm font-medium">
              <MessageSquare size={15}/> Envoyer un message
            </button>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground">
                <Heart size={13}/> Favori
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground">
                <Share2 size={13}/> Partager
              </button>
            </div>

            {contactOpen && (
              <div className="mt-5 pt-5 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold">JT</div>
                  <div>
                    <div className="text-sm font-medium">Jean Tchoumi</div>
                    <div className="text-xs text-muted-foreground">Agent ImmoPro</div>
                  </div>
                </div>
                <a href="tel:+237690000000" className="block text-sm text-primary">+237 6 90 00 00 00</a>
                <a href="mailto:agent@immopro.cm" className="block text-sm text-primary">agent@immopro.cm</a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </ClientLayout>
  );
}

function Caract({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-1 font-medium">{value ?? '—'}</div>
    </div>
  );
}
