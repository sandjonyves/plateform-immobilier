import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  disponible: 'bg-success/10 text-success border-success/20',
  en_negociation: 'bg-warning/10 text-warning border-warning/20',
  vendu: 'bg-danger/10 text-danger border-danger/20',
  loue: 'bg-info/10 text-info border-info/20',
  en_travaux: 'bg-muted text-muted-foreground border-border',
  archive: 'bg-muted text-muted-foreground border-border',
  en_attente: 'bg-warning/10 text-warning border-warning/20',
  confirmee: 'bg-success/10 text-success border-success/20',
  annulee: 'bg-danger/10 text-danger border-danger/20',
  actif: 'bg-success/10 text-success border-success/20',
  suspendu: 'bg-danger/10 text-danger border-danger/20',
};

const labels: Record<string, string> = {
  disponible: 'Disponible',
  en_negociation: 'En négociation',
  vendu: 'Vendu',
  loue: 'Loué',
  en_travaux: 'En travaux',
  archive: 'Archivé',
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
  actif: 'Actif',
  suspendu: 'Suspendu',
};

export function StatusBadge({ statut }: { statut: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md border', styles[statut] ?? 'bg-muted text-muted-foreground border-border')}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {labels[statut] ?? statut}
    </span>
  );
}
