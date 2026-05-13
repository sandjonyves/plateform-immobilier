import { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { FileDown, TrendingUp } from 'lucide-react';
import { useTransactionStore } from '../../../application/store/transactionStore';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';
const xafShort = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + ' M' : n >= 1000 ? (n / 1000).toFixed(0) + ' k' : n.toString();

export function RapportsPage() {
  const { transactions, charger: cTr } = useTransactionStore();
  const { terrains, charger: cT } = useTerrainStore();
  const { maisons, charger: cM } = useMaisonStore();

  useEffect(() => { cTr(); cT(); cM(); }, [cTr, cT, cM]);

  const ca12 = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const mois = d.toLocaleDateString('fr-FR', { month: 'short' });
      const base = 30_000_000 + Math.sin(i * 0.7) * 18_000_000 + Math.random() * 12_000_000;
      const loc = 5_000_000 + Math.cos(i * 0.5) * 2_000_000 + Math.random() * 1_500_000;
      return { mois, ventes: Math.round(base), locations: Math.round(loc) };
    });
  }, []);

  const parVille = useMemo(() => {
    const map = new Map<string, number>();
    [...terrains, ...maisons].forEach(b => map.set(b.ville, (map.get(b.ville) ?? 0) + b.prix));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [terrains, maisons]);

  const repTypes = useMemo(() => {
    const counts = new Map<string, number>();
    maisons.forEach(m => counts.set(m.type, (counts.get(m.type) ?? 0) + 1));
    counts.set('terrain', terrains.length);
    const colors = ['var(--primary)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--danger)', 'oklch(0.55 0.04 257)'];
    return Array.from(counts, ([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [terrains, maisons]);

  const totalVentes = ca12.reduce((s, r) => s + r.ventes, 0);
  const totalLoc = ca12.reduce((s, r) => s + r.locations, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Rapports"
        sous_titre="Analyses de performance et tendances 12 mois"
        actions={
          <button className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <FileDown size={15} /> Exporter PDF
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="CA ventes 12 mois" value={xaf(totalVentes)} delta={14.6} accent="success" />
        <KpiCard label="CA locations 12 mois" value={xaf(totalLoc)} delta={5.3} accent="info" />
        <KpiCard label="Transactions traitées" value={transactions.length.toString()} delta={8.1} accent="primary" />
        <KpiCard label="Taux conversion" value="68 %" delta={2.4} accent="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Chiffre d'affaires sur 12 mois</h3>
              <p className="text-xs text-muted-foreground">Ventes vs locations (XAF)</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-md font-medium">
              <TrendingUp size={12} /> +14,6 %
            </span>
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
                <Tooltip formatter={(v: number) => xaf(v)} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="ventes" stroke="var(--success)" fill="url(#gv)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="locations" stroke="var(--info)" fill="url(#gl)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-base font-semibold mb-1">Répartition par type</h3>
          <p className="text-xs text-muted-foreground mb-3">Biens en portefeuille</p>
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
            {repTypes.map(r => (
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
        <p className="text-xs text-muted-foreground mb-4">Cumul terrains + maisons</p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={parVille} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={xafShort} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => xaf(v)} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
