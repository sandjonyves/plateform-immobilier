/**
 * KPI card — delta optionnel (pas de fake % si absent).
 */
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number | null;
  spark?: number[];
  accent?: 'primary' | 'success' | 'warning' | 'info';
}

const accentColors = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  info: 'var(--info)',
};

export function KpiCard({ label, value, delta = null, spark, accent = 'primary' }: KpiCardProps) {
  const stroke = accentColors[accent];
  const data = (spark ?? []).map((v, i) => ({ i, v }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {delta !== null && delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md',
              delta >= 0 ? 'text-success bg-success/10' : 'text-danger bg-danger/10',
            )}
          >
            {delta >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-display font-bold tracking-tight">{value}</div>
      {data.length > 0 && (
        <div className="h-10 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
