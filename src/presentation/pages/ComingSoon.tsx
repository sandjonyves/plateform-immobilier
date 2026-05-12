import { PageHeader } from '../components/shared/PageHeader';

export function ComingSoon({ titre, description }: { titre: string; description: string }) {
  return (
    <div>
      <PageHeader titre={titre} sous_titre={description} />
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4 font-display text-xl font-bold">
          ✦
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">Bientôt disponible</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Cette section est en cours de construction. La page <span className="font-medium text-foreground">Overview</span> est entièrement fonctionnelle pour la démo.
        </p>
      </div>
    </div>
  );
}
