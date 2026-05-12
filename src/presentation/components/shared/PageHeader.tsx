interface PageHeaderProps {
  titre: string;
  sous_titre?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ titre, sous_titre, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">{titre}</h2>
        {sous_titre && <p className="text-sm text-muted-foreground mt-1">{sous_titre}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
