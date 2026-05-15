import { useEffect, useRef, useState } from 'react';

const CESIUM_VERSION = '1.118';
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium`;

declare global { interface Window { Cesium?: any; CESIUM_BASE_URL?: string; } }

let loadPromise: Promise<any> | null = null;
function loadCesium(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.Cesium) return Promise.resolve(window.Cesium);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    window.CESIUM_BASE_URL = CESIUM_BASE + '/';
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${CESIUM_BASE}/Widgets/widgets.css`;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = `${CESIUM_BASE}/Cesium.js`;
    s.onload = () => resolve(window.Cesium);
    s.onerror = () => reject(new Error('Échec du chargement de CesiumJS'));
    document.head.appendChild(s);
  });
  return loadPromise;
}

export interface ParcelleMarker {
  id: string;
  titre: string;
  type: 'terrain' | 'maison';
  statut: string;
  quartier: string;
  ville: string;
  prix: number;
  // pour terrains
  bornes?: { latitude: number; longitude: number }[];
  // pour maisons
  point?: { latitude: number; longitude: number };
}

export interface CesiumMapProps {
  parcelles: ParcelleMarker[];
  hauteurExtrusion?: number;
  onSelect?: (id: string | null) => void;
}

export function CesiumMap({ parcelles, hauteurExtrusion = 30, onSelect }: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCesium().then((Cesium) => {
      if (cancelled || !containerRef.current) return;
      try {
        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayer: Cesium.ImageryLayer.fromProviderAsync(
            Cesium.OpenStreetMapImageryProvider.fromUrl
              ? Cesium.OpenStreetMapImageryProvider.fromUrl('https://tile.openstreetmap.org/')
              : new Cesium.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' }),
          ),
          baseLayerPicker: false,
          geocoder: false,
          timeline: false,
          animation: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          homeButton: false,
          infoBox: false,
          selectionIndicator: false,
          fullscreenButton: false,
          creditContainer: document.createElement('div'),
        });
        viewer.scene.globe.enableLighting = false;
        viewerRef.current = viewer;
        setReady(true);

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((evt: any) => {
          const picked = viewer.scene.pick(evt.position);
          if (picked && picked.id && picked.id.id) {
            onSelect?.(picked.id.id as string);
          } else {
            onSelect?.(null);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      } catch (e) {
        setError((e as Error).message);
      }
    }).catch((e) => setError(e.message));
    return () => {
      cancelled = true;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try { viewerRef.current.destroy(); } catch { /* noop */ }
      }
      viewerRef.current = null;
    };
  }, [onSelect]);

  // Sync parcelles
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium) return;
    const Cesium = window.Cesium;
    viewer.entities.removeAll();

    const statutColor: Record<string, any> = {
      disponible: Cesium.Color.fromCssColorString('#16a34a'),
      en_negociation: Cesium.Color.fromCssColorString('#f59e0b'),
      vendu: Cesium.Color.fromCssColorString('#dc2626'),
      loue: Cesium.Color.fromCssColorString('#2563eb'),
      en_travaux: Cesium.Color.fromCssColorString('#737373'),
      archive: Cesium.Color.fromCssColorString('#737373'),
    };

    parcelles.forEach((p) => {
      const color = statutColor[p.statut] ?? Cesium.Color.GRAY;
      const desc = `<table class="cesium-infoBox-defaultTable"><tbody>
        <tr><th>Quartier</th><td>${p.quartier}, ${p.ville}</td></tr>
        <tr><th>Statut</th><td>${p.statut}</td></tr>
        <tr><th>Prix</th><td>${p.prix.toLocaleString('fr-FR')} XAF</td></tr>
      </tbody></table>`;

      if (p.type === 'terrain' && p.bornes && p.bornes.length >= 3) {
        const flat: number[] = [];
        p.bornes.forEach(b => { flat.push(b.longitude, b.latitude); });
        viewer.entities.add({
          id: p.id,
          name: p.titre,
          description: desc,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flat),
            material: color.withAlpha(0.55),
            extrudedHeight: hauteurExtrusion,
            outline: true,
            outlineColor: color,
          },
        });
        // Bornes pins
        p.bornes.forEach((b, i) => {
          viewer.entities.add({
            id: `${p.id}-borne-${i}`,
            position: Cesium.Cartesian3.fromDegrees(b.longitude, b.latitude, hauteurExtrusion + 2),
            point: {
              pixelSize: 8,
              color: Cesium.Color.WHITE,
              outlineColor: color,
              outlineWidth: 2,
            },
            label: {
              text: `B${i + 1}`,
              font: '11px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -14),
              scale: 0.9,
            },
          });
        });
      } else if (p.point) {
        viewer.entities.add({
          id: p.id,
          name: p.titre,
          description: desc,
          position: Cesium.Cartesian3.fromDegrees(p.point.longitude, p.point.latitude, 5),
          billboard: undefined,
          point: {
            pixelSize: 14,
            color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: p.titre,
            font: '11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -22),
            scale: 0.9,
          },
        });
      }
    });

    if (parcelles.length > 0) {
      viewer.flyTo(viewer.entities, { duration: 1.2 });
    }
  }, [parcelles, hauteurExtrusion, ready]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-card/80">
          Chargement de CesiumJS…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-danger bg-card">
          Erreur Cesium : {error}
        </div>
      )}
    </div>
  );
}
