import { useRouterState } from '@tanstack/react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  // Accueil public (/), espace client (/client/*) et auth — pas de chrome admin.
  const isPublic =
    path === '/' ||
    path === '/auth' ||
    path === '/client' ||
    path.startsWith('/client/');
  if (isPublic) {
    return <>{children}</>;
  }
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
