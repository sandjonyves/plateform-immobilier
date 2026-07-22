import { ClientHeader } from './ClientHeader';
import { ClientFooter } from './ClientFooter';
import { WhatsAppFab } from './WhatsAppFab';
import { useTheme } from '../../../application/hooks/useTheme';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useTheme(); // initialise le thème (système / persisté)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClientHeader />
      <main className="flex-1">{children}</main>
      <ClientFooter />
      <WhatsAppFab />
    </div>
  );
}
