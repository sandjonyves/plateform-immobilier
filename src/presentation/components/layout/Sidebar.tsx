import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard, MapPin, Home, Users, Receipt, Map, Calendar,
  MessageSquare, FileText, BarChart3, Settings, ChevronLeft, Building2,
} from 'lucide-react';
import { useUiStore } from '../../../application/store/uiStore';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/terrains', label: 'Terrains', icon: MapPin },
  { to: '/maisons', label: 'Maisons', icon: Home },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/carte', label: 'Carte', icon: Map },
  { to: '/agenda', label: 'Agenda', icon: Calendar },
  { to: '/messagerie', label: 'Messagerie', icon: MessageSquare, badge: 3 },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/rapports', label: 'Rapports', icon: BarChart3 },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
] as const;

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-200 shrink-0',
        collapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      <div className="h-[60px] flex items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0">
          <Building2 size={18} />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight">ImmoPro</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.map((it) => {
          const active = it.to === '/' ? path === '/' : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors relative',
                active
                  ? 'bg-sidebar-accent text-primary font-medium'
                  : 'text-foreground/70 hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1">{it.label}</span>}
              {!collapsed && 'badge' in it && it.badge ? (
                <span className="text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 min-w-[18px] text-center">
                  {it.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground text-xs font-semibold">
              JT
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Jean Tchoumi</div>
              <div className="text-xs text-muted-foreground truncate">Administrateur</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground text-xs font-semibold">
            JT
          </div>
        )}
        <button
          onClick={toggle}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-sidebar-accent/60"
        >
          <ChevronLeft size={14} className={cn('transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </aside>
  );
}
