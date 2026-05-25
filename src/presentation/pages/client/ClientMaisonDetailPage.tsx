import { useEffect, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Maximize2, BedDouble, Bath, Building, Phone, Calendar, MessageSquare, Heart, Share2, Play } from 'lucide-react';
import { ClientLayout } from '../../components/client/ClientLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CesiumMap, type ParcelleMarker } from '../../components/map/CesiumMap';
import { useMaisonStore } from '../../../application/store/maisonStore';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

export function ClientMaisonDetailPage() {
  const { id } = useParams({ from: '/client/maisons/$id' });
  const maisons = useMaisonStore((s) => s.maisons);
  const charger = useMaisonStore((s) => s.charger);
  useEffect(() => { if (maisons.length === 0) charger(); }, [charger, maisons.length]);

  const [tab, setTab] = useState<'photos' | 'videos' | 'carte'>('photos');
  const maison = maisons.find((m) => m.id === id);

  if (!maison) {
    return (
      <ClientLayout>
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Maison introuvable</h1>
          <Link to="/client/maisons" className="mt-4 inline-flex text-primary text-sm">← Retour aux maisons</Link>
        </div>
      </ClientLayout>
    );
  }

  const marker: ParcelleMarker = {
    id: maison.id, titre: maison.titre, type: 'maison',
    statut: maison.statut, quartier: maison.quartier, ville: maison.ville,
    prix: maison.prix, point: maison.localisation,
  };

  return (
    <ClientLayout>
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <Link to="/client/maisons" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Retour aux maisons
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge statut={maison.statut} />
              <span className="text-xs font-semibold uppercase tracking-wide bg-accent text-accent-foreground px-2 py-1 rounded capitalize">{maison.type}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">{maison.titre}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin size={15}/> {maison.quartier}, {maison.ville}
            </div>
          </div>

          {/* Tabs media + carte */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex border-b border-border">
              {(['photos', 'videos', 'carte'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                  {t === 'carte' ? 'Carte 3D' : t}
                </button>
              ))}
            </div>
            <div className="h-[460px]">
              {tab === 'photos' && (
                maison.photos.length > 0 ? (
                  <div className="grid grid-cols-2 h-full gap-1 p-1">
                    {maison.photos.slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt={`${maison.titre} ${i+1}`} className="w-full h-full object-cover rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="h-full bg-gradient-to-br from-accent to-muted flex items-center justify-center text-muted-foreground">
                    Aucune photo disponible
                  </div>
                )
              )}
              {tab === 'videos' && (
                maison.videos.length > 0 ? (
                  <video src={maison.videos[0]} controls className="w-full h-full object-cover bg-black" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Play size={36} /> Aucune vidéo disponible
                  </div>
                )
              )}
              {tab === 'carte' && <CesiumMap parcelles={[marker]} />}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{maison.description}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Caractéristiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
              <Caract icon={<Maximize2 size={14}/>} label="Surface" value={`${maison.surface_m2} m²`} />
              <Caract icon={<BedDouble size={14}/>} label="Chambres" value={`${maison.chambres}`} />
              <Caract icon={<Bath size={14}/>} label="Salles de bain" value={`${maison.salles_de_bain}`} />
              <Caract icon={<Building size={14}/>} label="Étages" value={`${maison.etages}`} />
              <Caract label="Type" value={maison.type} />
              <Caract label="Ville" value={maison.ville} />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <div className="text-xs text-muted-foreground">Prix</div>
            <div className="font-display text-3xl font-bold text-primary mt-1">{xaf(maison.prix)}</div>

            <div className="my-5 h-px bg-border" />

            <button className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">
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
          </div>
        </aside>
      </div>
    </ClientLayout>
  );
}

function Caract({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-1 font-medium capitalize">{value}</div>
    </div>
  );
}
