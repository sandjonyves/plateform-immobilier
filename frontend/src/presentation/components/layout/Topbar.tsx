import { Search, Moon, Sun, ChevronRight } from 'lucide-react';
import { useRouterState } from '@tanstack/react-router';
import { useUiStore } from '../../../application/store/uiStore';
import { useAuthStore } from '../../../application/store/authStore';

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/terrains': 'Terrains',
  '/maisons': 'Maisons',
  '/utilisateurs': 'Utilisateurs',
  '/ventes': 'Ventes',
  '/carte': 'Carte globale',
  '/agenda': 'Agenda',
  '/documents': 'Documents',
  '/rapports': 'Rapports',
  '/parametres': 'Paramètres',
};

export function Topbar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const dark = useUiStore((s) => s.darkMode);
  const toggleDark = useUiStore((s) => s.toggleDark);
  const user = useAuthStore((s) => s.user);
  const title = titles[path] ?? 'ImmoPro';
  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() || 'IP'
    : 'IP';

  return (
    <header className="h-[60px] shrink-0 border-b border-border bg-card flex items-center px-6 gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="font-display text-lg font-semibold truncate">{title}</h1>
        <ChevronRight size={14} className="text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground truncate">Tableau de bord</span>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <div className="relative opacity-50">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            disabled
            placeholder="Recherche bientôt disponible…"
            title="Recherche globale désactivée pour la v1"
            className="w-full h-9 rounded-lg bg-secondary border border-transparent pl-9 pr-12 text-sm outline-none cursor-not-allowed"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium bg-background border border-border rounded px-1.5 py-0.5 text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={toggleDark} className="w-9 h-9 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        {/* Cloche notifications désactivée v1 — code conservé hors UI */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground text-xs font-semibold ml-1">
          {initials}
        </div>
      </div>
    </header>
  );
}
