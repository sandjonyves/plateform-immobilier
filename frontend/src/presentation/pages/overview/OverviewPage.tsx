import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { MapPin, Plus, Home, BarChart3, Activity } from 'lucide-react';
import { useTerrainStore } from '../../../application/store/terrainStore';
import {
  fetchActivites,
  fetchOverview,
  type ActiviteDto,
  type OverviewDto,
} from '../../../infrastructure/api/resources';
import { KpiCard } from '../../components/shared/KpiCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { MaisonForm } from '../../components/forms/MaisonForm';
import { TerrainForm } from '../../components/forms/TerrainForm';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

const REPARTITION_COLORS: Record<string, string> = {
  terrains_dispo: 'var(--success)',
  terrains_nego: 'var(--warning)',
  terrains_vendus: 'var(--danger)',
  maisons_dispo: 'var(--primary)',
  maisons_loue: 'var(--info)',
  maisons_vendues: 'oklch(0.55 0.04 257)',
};

export function OverviewPage() {
  const { terrains, charger: chargerT } = useTerrainStore();
  const navigate = useNavigate();
  const [openMaison, setOpenMaison] = useState(false);
  const [openTerrain, setOpenTerrain] = useState(false);
  const [overview, setOverview] = useState<OverviewDto | null>(null);
  const [activites, setActivites] = useState<ActiviteDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chargerT();
    void Promise.all([fetchOverview(), fetchActivites(12)])
      .then(([ov, acts]) => {
        setOverview(ov);
        setActivites(acts);
      })
      .catch((e) => setError((e as Error).message));
  }, [chargerT]);

  const data30 = overview?.activite_30j ?? [];

  const repartition = useMemo(() => {
    return (overview?.repartition ?? []).map((r) => ({
      ...r,
      color: REPARTITION_COLORS[r.key] ?? 'var(--primary)',
    }));
  }, [overview]);

  const sparkAnnonces = data30.map((d) => d.annonces);
  const sparkVentes = data30.map((d) => d.ventes);

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        titre="Overview"
        sous_titre="Vue d'ensemble de votre portefeuille immobilier — Cameroun"
        actions={
          <>
            <button onClick={() => navigate({ to: '/rapports' })} className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary transition-colors flex items-center gap-1.5">
              <BarChart3 size={15} /> Rapports
            </button>
            <button onClick={() => setOpenMaison(true)} className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary transition-colors flex items-center gap-1.5">
              <Home size={15} /> + Maison
            </button>
            <button onClick={() => setOpenTerrain(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus size={15} /> Ajouter un terrain
            </button>
          </>
        }
      />

      {error && (
        <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Biens totaux"
          value={(overview?.biens_totaux ?? 0).toString()}
          spark={sparkAnnonces}
          accent="primary"
        />
        <KpiCard
          label="Revenus ce mois"
          value={xaf(overview?.ca_mois ?? 0)}
          spark={sparkVentes}
          accent="success"
        />
        <KpiCard
          label="Utilisateurs actifs"
          value={(overview?.utilisateurs_actifs ?? 0).toString()}
          accent="info"
        />
        <KpiCard
          label="Ventes en attente"
          value={(overview?.ventes_en_attente ?? 0).toString()}
          accent="warning"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 text-sm">
        <MiniStat label="Terrains" value={overview?.terrains_total ?? 0} />
        <MiniStat label="Maisons" value={overview?.maisons_total ?? 0} />
        <MiniStat label="Appartements" value={overview?.appartements ?? 0} />
        <MiniStat label="Ventes" value={overview?.ventes_total ?? 0} />
        <MiniStat label="Clients" value={overview?.clients ?? 0} />
        <MiniStat label="Admins" value={overview?.admins ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Activité 30 derniers jours</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Annonces publiées et ventes traitées</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Annonces</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" />Ventes</span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data30} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="annonces" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ventes" stroke="var(--success)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-base font-semibold mb-1">Répartition des biens</h3>
          <p className="text-xs text-muted-foreground">Par type et statut</p>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {repartition.map((e, i) => <Cell key={i} fill={e.color} stroke="var(--card)" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {repartition.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-muted-foreground truncate">{r.name}</span>
                <span className="font-medium ml-auto">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <h3 className="font-display text-base font-semibold">Activité récente</h3>
            </div>
            <button onClick={() => navigate({ to: '/ventes' })} className="text-xs text-primary hover:underline">Tout voir</button>
          </div>
          <div className="divide-y divide-border">
            {activites.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-info/80 flex items-center justify-center text-primary-foreground text-[11px] font-semibold shrink-0">
                  {a.auteur.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate"><span className="font-medium">{a.auteur}</span> — {a.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(a.date), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{a.type}</span>
              </div>
            ))}
            {activites.length === 0 && (
              <div className="p-5 text-sm text-muted-foreground">Aucune activité récente.</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h3 className="font-display text-base font-semibold">Derniers terrains</h3>
          </div>
          <div className="space-y-2.5">
            {terrains.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.titre}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.quartier}, {t.ville} · {t.surface_m2.toLocaleString('fr-FR')} m²
                  </div>
                </div>
                <StatusBadge statut={t.statut} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <MaisonForm open={openMaison} onClose={() => setOpenMaison(false)} />
    <TerrainForm open={openTerrain} onClose={() => setOpenTerrain(false)} />
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-lg font-display font-semibold tabular-nums">{value}</div>
    </div>
  );
}
