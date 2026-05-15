import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, MapPin, Filter, Eye, Archive, Ruler } from 'lucide-react';
import { format } from 'date-fns';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KpiCard } from '../../components/shared/KpiCard';
import { TerrainForm } from '../../components/forms/TerrainForm';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';
const m2 = (n: number) => n.toLocaleString('fr-FR') + ' m²';

export function TerrainsPage() {
  const { terrains, charger } = useTerrainStore();
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState<string>('tous');
  const [ville, setVille] = useState<string>('toutes');
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => { charger(); }, [charger]);

  const villes = useMemo(() => Array.from(new Set(terrains.map(t => t.ville))), [terrains]);

  const filtered = useMemo(() => terrains.filter(t =>
    (statut === 'tous' || t.statut === statut) &&
    (ville === 'toutes' || t.ville === ville) &&
    (q === '' || t.titre.toLowerCase().includes(q.toLowerCase()) || t.quartier.toLowerCase().includes(q.toLowerCase())),
  ), [terrains, q, statut, ville]);

  const kpi = useMemo(() => ({
    total: terrains.length,
    dispo: terrains.filter(t => t.statut === 'disponible').length,
    surfaceTot: terrains.reduce((s, t) => s + t.surface_m2, 0),
    valeur: terrains.reduce((s, t) => s + t.prix, 0),
  }), [terrains]);

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Terrains"
        sous_titre="Gestion du portefeuille de terrains avec polygones GPS"
        actions={
          <button onClick={() => setOpenForm(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <Plus size={15} /> Ajouter un terrain
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Terrains totaux" value={kpi.total.toString()} delta={5.2} accent="primary" />
        <KpiCard label="Disponibles" value={kpi.dispo.toString()} delta={2.1} accent="success" />
        <KpiCard label="Surface cumulée" value={m2(kpi.surfaceTot)} delta={4.8} accent="info" />
        <KpiCard label="Valeur du portefeuille" value={xaf(kpi.valeur)} delta={9.4} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un terrain, quartier…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <select value={statut} onChange={(e) => setStatut(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
            <option value="tous">Tous statuts</option>
            <option value="disponible">Disponible</option>
            <option value="en_negociation">En négociation</option>
            <option value="vendu">Vendu</option>
            <option value="archive">Archivé</option>
          </select>
          <select value={ville} onChange={(e) => setVille(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
            <option value="toutes">Toutes villes</option>
            {villes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button className="h-9 px-3 text-sm rounded-lg border border-border bg-background hover:bg-secondary flex items-center gap-1.5">
            <Filter size={14} /> Plus
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-medium px-4 py-3">Terrain</th>
                <th className="text-left font-medium px-4 py-3">Localisation</th>
                <th className="text-right font-medium px-4 py-3">Surface</th>
                <th className="text-right font-medium px-4 py-3">Prix</th>
                <th className="text-left font-medium px-4 py-3">Bornes</th>
                <th className="text-left font-medium px-4 py-3">Statut</th>
                <th className="text-left font-medium px-4 py-3">Ajouté</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
                        <MapPin size={15} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{t.titre}</div>
                        <div className="text-xs text-muted-foreground">{t.titre_foncier}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{t.quartier}</div>
                    <div className="text-xs text-muted-foreground">{t.ville}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{m2(t.surface_m2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{xaf(t.prix)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded">
                      <Ruler size={11} /> {t.bornes.length}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge statut={t.statut} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(t.date_ajout), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center" title="Voir">
                        <Eye size={14} />
                      </button>
                      <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center" title="Archiver">
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Aucun terrain trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <span>{filtered.length} terrain(s) affiché(s) sur {terrains.length}</span>
          <span>Page 1 / 1</span>
        </div>
      </div>
    </div>
      <TerrainForm open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
