import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadMediaApi } from '../../../infrastructure/api/resources';

type Kind = 'image' | 'video';

interface MediaUploaderProps {
  label: string;
  icon?: React.ReactNode;
  kind: Kind;
  urls: string[];
  onChange: (urls: string[]) => void;
}

/**
 * Upload multi-fichiers vers l'API (URLs persistées, pas de blob locaux).
 */
export function MediaUploader({ label, icon, kind, urls, onChange }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const accept = kind === 'image' ? 'image/*' : 'video/*';

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });
    const uploaded: string[] = [];
    try {
      for (let i = 0; i < list.length; i++) {
        const { url } = await uploadMediaApi(list[i], kind);
        uploaded.push(url);
        setProgress({ done: i + 1, total: list.length });
      }
      onChange([...urls, ...uploaded]);
    } catch (e) {
      setError((e as Error).message || 'Échec de l\'upload');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          {icon} {label}
        </span>
        <label className={`h-8 px-2 text-xs rounded-md border border-border hover:bg-secondary flex items-center gap-1 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading && progress ? `${progress.done}/${progress.total}` : 'Ajouter'}
          <input
            type="file"
            accept={accept}
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {error && <p className="text-[11px] text-danger">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <div key={url + i} className="relative aspect-video rounded-md overflow-hidden border border-border bg-secondary">
            {kind === 'image' ? (
              <img src={url} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={url} className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-danger text-white flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
