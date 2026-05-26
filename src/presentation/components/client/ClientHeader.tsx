import { useState } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Building2, Search, User, MessageCircle, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { openWhatsApp } from '../../../lib/whatsapp';

const nav = [
  { to: '/client', label: 'Accueil', exact: true },
  { to: '/client/terrains', label: 'Terrains' },
  { to: '/client/maisons', label: 'Maisons' },
  { to: '/client/services', label: 'Services' },
  { to: '/client/carte', label: 'Carte 3D' },
];

export function ClientHeader() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: '/client/terrains', search: { q } as never });
    setShowSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto h-16 px-6 flex items-center gap-6">
        <Link to="/client" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Building2 size={18} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">ImmoPro</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={cn('px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active ? 'text-primary bg-accent' : 'text-foreground/75 hover:text-foreground hover:bg-accent/60')}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {showSearch ? (
          <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9">
            <Search size={15} className="text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…" className="bg-transparent outline-none text-sm w-48" />
            <button type="button" onClick={() => setShowSearch(false)} className="text-muted-foreground hover:text-foreground"><X size={14}/></button>
          </form>
        ) : (
          <button onClick={() => setShowSearch(true)} aria-label="Rechercher"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-foreground/70">
            <Search size={17} />
          </button>
        )}

        <ThemeToggle />

        <button
          onClick={() => openWhatsApp('Bonjour ImmoPro, je souhaite plus d\'informations.')}
          aria-label="WhatsApp"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-success"
        >
          <MessageCircle size={17} />
        </button>

        <Link to="/" className="hidden md:inline-flex h-9 items-center px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground border border-border">
          Espace pro
        </Link>

        <button className="hidden md:inline-flex h-9 items-center gap-2 px-3.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <User size={15} /> Connexion
        </button>

        <button onClick={() => setOpen(!open)} className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="flex flex-col p-4 gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium hover:bg-accent">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
