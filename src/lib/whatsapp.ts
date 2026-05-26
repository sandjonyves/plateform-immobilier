export const WHATSAPP_NUMBER = '237696652440';
export const WHATSAPP_DISPLAY = '+237 696 652 440';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  if (typeof window !== 'undefined') {
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  }
}
