import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../../lib/whatsapp';

export function WhatsAppFab() {
  return (
    <button
      onClick={() => openWhatsApp('Bonjour ImmoPro, je souhaite des informations.')}
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-success text-white shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
    >
      <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-30" />
      <MessageCircle size={24} className="relative" />
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Discuter sur WhatsApp
      </span>
    </button>
  );
}
