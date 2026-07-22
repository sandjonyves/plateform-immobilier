import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  titre: string;
  sous_titre?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({ open, onClose, titre, sous_titre, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh]', sizes[size])}>
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-display text-lg font-semibold">{titre}</h2>
            {sous_titre && <p className="text-xs text-muted-foreground mt-0.5">{sous_titre}</p>}
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function FormField({
  label, hint, error, children, required,
}: { label: string; hint?: string; error?: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground/80 flex items-center gap-1">
        {label}{required && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint && !error && <span className="text-[11px] text-muted-foreground block">{hint}</span>}
      {error && <span className="text-[11px] text-danger block">{error}</span>}
    </label>
  );
}

export function FormFooter({ onCancel, submitLabel = 'Enregistrer', loading }: { onCancel: () => void; submitLabel?: string; loading?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
      <button type="button" onClick={onCancel}
        className="h-9 px-4 text-sm rounded-lg border border-border hover:bg-secondary">
        Annuler
      </button>
      <button type="submit" disabled={loading}
        className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
        {loading ? 'Enregistrement…' : submitLabel}
      </button>
    </div>
  );
}

export const inputClass = 'w-full h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40';
export const textareaClass = 'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none';
