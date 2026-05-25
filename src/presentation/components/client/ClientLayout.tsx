import { ClientHeader } from './ClientHeader';
import { ClientFooter } from './ClientFooter';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClientHeader />
      <main className="flex-1">{children}</main>
      <ClientFooter />
    </div>
  );
}
