import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Bed, Bath, Square, Home, MapPin, Image as ImageIcon, Video as VideoIcon, Archive } from 'lucide-react';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KpiCard } from '../../components/shared/KpiCard';
import { MaisonForm } from '../../components/forms/MaisonForm';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

export function MaisonsPage() {
  const { maisons, charger, archiver } = useMaisonStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('tous');
  const [statut, setStatut] = useState('tous');
  const [openForm, setOpenForm] = useState(false);
  const [archiving, setArchiving] = useState<string | null>(null);

  useEffect(() => { charger(); }, [charger]);

  const filtered = useMemo(() => maisons.filter(m =>
    (type === 'tous' || m.type === type) &&
    (statut === 'tous' || m.statut === statut) &&
    (q === '' || m.titre.toLowerCase().includes(q.toLowerCase()) || m.quartier.toLowerCase().includes(q.toLowerCase())),
  ), [maisons, q, type, statut]);

  const kpi = useMemo(() => ({
    total: maisons.length,
    dispo: maisons.filter(m => m.statut === 'disponible').length,
    loue: maisons.filter(m => m.statut === 'loue').length,
    valeur: maisons.reduce((s, m) => s + m.prix, 0),
  }), [maisons]);

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        titre="Maisons"
        sous_titre="Catalogue de villas, appartements, duplex et bureaux"
        actions={
          <button onClick={() => setOpenForm(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <Plus size={15} /> Ajouter une maison
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Biens totaux" value={kpi.total.toString()} delta={6.1} accent="primary" />
        <KpiCard label="Disponibles" value={kpi.dispo.toString()} delta={1.8} accent="success" />
        <KpiCard label="Louées" value={kpi.loue.toString()} delta={4.2} accent="info" />
        <KpiCard label="Valeur catalogue" value={xaf(kpi.valeur)} delta={11.3} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une maison, quartier…"
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
          <option value="tous">Tous types</option>
          <option value="villa">Villa</option>
          <option value="appartement">Appartement</option>
          <option value="duplex">Duplex</option>
          <option value="studio">Studio</option>
          <option value="bureau">Bureau</option>
        </select>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
          <option value="tous">Tous statuts</option>
          <option value="disponible">Disponible</option>
          <option value="loue">Loué</option>
          <option value="vendu">Vendu</option>
          <option value="en_travaux">En travaux</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <article key={m.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
            <div className="h-36 bg-gradient-to-br from-primary/20 via-info/10 to-success/20 relative flex items-center justify-center overflow-hidden">
              {m.photos[0]
                ? <img src={m.photos[0]} alt={m.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                : <Home size={42} className="text-primary/40 group-hover:scale-110 transition-transform" />}
              <div className="absolute top-2 left-2"><StatusBadge statut={m.statut} /></div>
              <div className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-card/80 backdrop-blur text-foreground px-2 py-0.5 rounded">
                {m.type}
              </div>
              {(m.photos.length > 0 || m.videos.length > 0) && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] bg-black/50 text-white backdrop-blur px-1.5 py-0.5 rounded">
                  {m.photos.length > 0 && <span className="flex items-center gap-0.5"><ImageIcon size={10} />{m.photos.length}</span>}
                  {m.videos.length > 0 && <span className="flex items-center gap-0.5"><VideoIcon size={10} />{m.videos.length}</span>}
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-display font-semibold leading-tight truncate">{m.titre}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} /> {m.quartier}, {m.ville}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Bed size={13} /> {m.chambres}</span>
                <span className="flex items-center gap-1"><Bath size={13} /> {m.salles_de_bain}</span>
                <span className="flex items-center gap-1"><Square size={13} /> {m.surface_m2} m²</span>
              </div>
              <div className="pt-2 flex items-end justify-between border-t border-border gap-2">
                <div>
                  <div className="text-[11px] text-muted-foreground">Prix</div>
                  <div className="font-display font-bold text-primary">{xaf(m.prix)}</div>
                </div>
                <button
                  type="button"
                  disabled={m.statut === 'archive' || archiving === m.id}
                  onClick={async () => {
                    if (!confirm(`Archiver « ${m.titre} » ?`)) return;
                    setArchiving(m.id);
                    try { await archiver(m.id); }
                    catch (e) { alert((e as Error).message); }
                    finally { setArchiving(null); }
                  }}
                  className="text-xs text-muted-foreground hover:text-danger inline-flex items-center gap-1 disabled:opacity-40"
                  title="Archiver"
                >
                  <Archive size={12} /> Archiver
                </button>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
            Aucune maison ne correspond aux filtres.
          </div>
        )}
      </div>
    </div>
    <MaisonForm open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
