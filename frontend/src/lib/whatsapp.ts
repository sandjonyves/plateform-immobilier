export const WHATSAPP_NUMBER = '237678727647';
export const WHATSAPP_DISPLAY = '+237 678 727 647';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  if (typeof window !== 'undefined') {
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  }
}
