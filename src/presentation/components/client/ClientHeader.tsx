import { Link, useRouterState } from '@tanstack/react-router';
import { Building2, Search, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/client', label: 'Accueil', exact: true },
  { to: '/client/terrains', label: 'Terrains' },
  { to: '/client/maisons', label: 'Maisons' },
  { to: '/client/carte', label: 'Carte 3D' },
];

export function ClientHeader() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto h-16 px-6 flex items-center gap-8">
        <Link to="/client" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Building2 size={18} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">ImmoPro</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active ? 'text-primary bg-accent' : 'text-foreground/75 hover:text-foreground hover:bg-accent/60',
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1" />
        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-foreground/70">
          <Search size={18} />
        </button>
        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-foreground/70">
          <Heart size={18} />
        </button>
        <Link
          to="/"
          className="hidden md:inline-flex h-9 items-center px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground border border-border"
        >
          Espace pro
        </Link>
        <button className="inline-flex h-9 items-center gap-2 px-3.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <User size={15} />
          Connexion
        </button>
      </div>
    </header>
  );
}
