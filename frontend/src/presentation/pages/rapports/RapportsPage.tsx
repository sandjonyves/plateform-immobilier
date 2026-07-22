import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FileDown } from 'lucide-react';
import { fetchRapports, type RapportsDto } from '../../../infrastructure/api/resources';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';
const xafShort = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + ' M' : n >= 1000 ? (n / 1000).toFixed(0) + ' k' : n.toString();

const COLORS = ['var(--primary)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--danger)', 'oklch(0.55 0.04 257)'];

export function RapportsPage() {
  const [data, setData] = useState<RapportsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchRapports()
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  const ca12 = useMemo(
    () =>
      (data?.ca_12_mois ?? []).map((r) => ({
        mois: r.label.split(' ')[0],
        terrains: r.terrains,
        maisons: r.maisons,
      })),
    [data],
  );

  const parVille = useMemo(
    () => (data?.valeur_par_ville ?? []).map((v) => ({ name: v.ville, value: v.valeur })),
    [data],
  );

  const repTypes = useMemo(() => {
    const rows = data?.repartition_types_maisons ?? [];
    return rows.map((r, i) => ({
      name: r.type,
      value: r.count,
      color: COLORS[i % COLORS.length],
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Rapports"
        sous_titre="Analyses de performance et tendances 12 mois"
        actions={
          <button
            type="button"
            disabled
            title="Export PDF bientôt disponible"
            className="h-9 px-3 text-sm font-medium rounded-lg bg-primary/50 text-primary-foreground cursor-not-allowed flex items-center gap-1.5"
          >
            <FileDown size={15} /> Exporter PDF
          </button>
        }
      />

      {error && (
        <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="CA terrains 12 mois" value={xaf(data?.ca_terrains_12m ?? 0)} accent="success" />
        <KpiCard label="CA maisons 12 mois" value={xaf(data?.ca_maisons_12m ?? 0)} accent="info" />
        <KpiCard label="Ventes traitées" value={(data?.ventes_traitees ?? 0).toString()} accent="primary" />
        <KpiCard label="Taux conversion" value={`${data?.taux_conversion ?? 0} %`} accent="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Chiffre d&apos;affaires sur 12 mois</h3>
              <p className="text-xs text-muted-foreground">Terrains vs maisons (XAF)</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ca12} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--info)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={xafShort} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => xaf(Number(v))} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="terrains" stroke="var(--success)" fill="url(#gv)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="maisons" stroke="var(--info)" fill="url(#gl)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-base font-semibold mb-1">Répartition par type</h3>
          <p className="text-xs text-muted-foreground mb-3">Maisons en portefeuille</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={repTypes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {repTypes.map((e, i) => <Cell key={i} fill={e.color} stroke="var(--card)" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {repTypes.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <span className="capitalize text-muted-foreground truncate">{r.name}</span>
                <span className="ml-auto font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display text-base font-semibold mb-1">Valeur du portefeuille par ville</h3>
        <p className="text-xs text-muted-foreground mb-4">Cumul terrains + maisons disponibles</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parVille} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={xafShort} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => xaf(Number(v))} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
