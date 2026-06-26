import { useEffect, useRef, useState } from 'react';

const CESIUM_VERSION = '1.118';
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium`;

declare global { interface Window { Cesium?: any; CESIUM_BASE_URL?: string; } }

// Le token Ion est récupéré dynamiquement depuis une fonction serveur
// pour débloquer l'imagerie Bing Aerial HD, le World Terrain et OSM Buildings 3D Tiles.

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
  bornes?: { latitude: number; longitude: number }[];
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
  const [hasIonToken, setHasIonToken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCesium().then(async (Cesium) => {
      if (cancelled || !containerRef.current) return;
      try {
        let ionToken: string | undefined;
        try {
          const { getCesiumConfig } = await import('@/lib/cesium.functions');
          const cfg = await getCesiumConfig();
          ionToken = cfg.token || undefined;
        } catch { /* silencieux */ }
        if (ionToken) {
          Cesium.Ion.defaultAccessToken = ionToken;
          setHasIonToken(true);
        }

        // --- Imagerie haute résolution ---------------------------------------
        // Si un token Ion est dispo → Bing Aerial Labels (très haute qualité).
        // Sinon → ArcGIS World Imagery (satellite gratuit, nettement plus net qu'OSM).
        let baseLayer: any;
        if (ionToken) {
          baseLayer = Cesium.ImageryLayer.fromProviderAsync(
            Cesium.IonImageryProvider.fromAssetId(3), // Bing Aerial w/ Labels
          );
        } else {
          baseLayer = Cesium.ImageryLayer.fromProviderAsync(
            Cesium.ArcGisMapServerImageryProvider.fromUrl(
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
              { enablePickFeatures: false },
            ),
          );
        }

        // --- Terrain réaliste (relief) ---------------------------------------
        const terrainProvider = ionToken
          ? await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
              requestVertexNormals: true,
              requestWaterMask: true,
            })
          : new Cesium.EllipsoidTerrainProvider();

        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayer,
          terrainProvider,
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
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
          msaaSamples: 4,
          creditContainer: document.createElement('div'),
        });

        // --- Qualité visuelle premium ----------------------------------------
        const scene = viewer.scene;
        // Résolution native (anti-flou sur écrans HiDPI)
        viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2);
        scene.postProcessStages.fxaa.enabled = true;
        if (scene.msaaSamples !== undefined) scene.msaaSamples = 4;

        // HDR : rendu physiquement réaliste de la lumière (couleurs naturelles)
        if (scene.highDynamicRange !== undefined) scene.highDynamicRange = true;

        // Éclairage basé sur la position réelle du soleil (heure actuelle)
        scene.light = new Cesium.SunLight();
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());

        // LOD nettement plus fin : tuiles plus détaillées au zoom proche
        scene.globe.maximumScreenSpaceError = 1.0;
        scene.globe.tileCacheSize = 1500;
        scene.globe.preloadSiblings = true;
        scene.globe.preloadAncestors = true;
        scene.globe.depthTestAgainstTerrain = true;
        scene.globe.enableLighting = true;
        scene.globe.dynamicAtmosphereLighting = true;
        scene.globe.dynamicAtmosphereLightingFromSun = true;
        scene.globe.atmosphereLightIntensity = 20;
        scene.globe.showGroundAtmosphere = true;
        // Relief plus prononcé pour mieux percevoir le terrain
        if (scene.verticalExaggeration !== undefined) scene.verticalExaggeration = 1.0;

        // Atmosphère / ciel / soleil pour rendu cinématique réaliste
        scene.skyAtmosphere.show = true;
        scene.skyAtmosphere.hueShift = -0.02;
        scene.skyAtmosphere.saturationShift = 0.12;
        scene.skyAtmosphere.brightnessShift = 0.05;
        if (scene.skyAtmosphere.atmosphereScaleHeightPower !== undefined) {
          scene.skyAtmosphere.atmosphereScaleHeightPower = 0.6;
        }
        scene.fog.enabled = true;
        scene.fog.density = 0.00008;
        if (scene.fog.screenSpaceErrorFactor !== undefined) scene.fog.screenSpaceErrorFactor = 4;
        scene.sun.show = true;
        scene.moon.show = true;
        scene.skyBox.show = true;

        // Ombres dynamiques projetées par les bâtiments / le relief
        viewer.shadows = true;
        viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
        scene.shadowMap.softShadows = true;
        scene.shadowMap.size = 4096;
        scene.shadowMap.maximumDistance = 10000;

        // Améliore la netteté des tuiles imagery au zoom proche
        viewer.imageryLayers.get(0).then?.((layer: any) => {
          if (layer) {
            layer.minificationFilter = Cesium.TextureMinificationFilter.LINEAR;
            layer.magnificationFilter = Cesium.TextureMagnificationFilter.LINEAR;
          }
        });

        // --- Rendu photoréaliste 3D (le plus immersif) -----------------------
        // Google Photorealistic 3D Tiles : monde réel en 3D (bâtiments, arbres,
        // relief texturé) — exactement « comme la réalité ». Fallback sur les
        // bâtiments OSM si les tuiles Google ne sont pas accessibles.
        if (ION_TOKEN) {
          let photoreal = false;
          try {
            const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207, {
              maximumScreenSpaceError: 8,
            });
            scene.primitives.add(tileset);
            // Le globe 2D devient inutile sous les tuiles photoréalistes
            scene.globe.show = true;
            photoreal = true;
          } catch { /* tuiles Google indisponibles pour ce token */ }

          if (!photoreal) {
            try {
              const buildings = await Cesium.createOsmBuildingsAsync();
              scene.primitives.add(buildings);
            } catch { /* silencieux */ }
          }
        }

        viewerRef.current = viewer;
        setReady(true);

        // --- Interaction : sélection ----------------------------------------
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((evt: any) => {
          const picked = viewer.scene.pick(evt.position);
          if (picked && picked.id && picked.id.id) {
            onSelect?.(picked.id.id as string);
          } else {
            onSelect?.(null);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Survol → curseur main
        handler.setInputAction((evt: any) => {
          const picked = viewer.scene.pick(evt.endPosition);
          viewer.canvas.style.cursor = picked && picked.id ? 'pointer' : 'default';
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
            shadows: Cesium.ShadowMode.ENABLED,
            classificationType: Cesium.ClassificationType.BOTH,
          },
        });
        p.bornes.forEach((b, i) => {
          viewer.entities.add({
            id: `${p.id}-borne-${i}`,
            position: Cesium.Cartesian3.fromDegrees(b.longitude, b.latitude, hauteurExtrusion + 2),
            point: {
              pixelSize: 9,
              color: Cesium.Color.WHITE,
              outlineColor: color,
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: `B${i + 1}`,
              font: '600 11px Inter, sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              scale: 0.9,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });
        });
      } else if (p.point) {
        viewer.entities.add({
          id: p.id,
          name: p.titre,
          description: desc,
          position: Cesium.Cartesian3.fromDegrees(p.point.longitude, p.point.latitude, 5),
          point: {
            pixelSize: 14,
            color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: p.titre,
            font: '600 11px Inter, sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -24),
            scale: 0.9,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }
    });

    // Caméra cinématique : survol fluide vers les entités
    if (parcelles.length > 0) {
      viewer.flyTo(viewer.entities, {
        duration: 2.0,
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(25),
          Cesium.Math.toRadians(-35),
          0,
        ),
      });
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
      {ready && !ION_TOKEN && (
        <div className="absolute top-2 right-2 max-w-xs text-[10px] leading-tight bg-card/90 backdrop-blur border border-border rounded-md px-2 py-1.5 text-muted-foreground">
          Mode satellite ArcGIS. Pour un rendu <strong>photoréaliste 3D</strong> (bâtiments, relief et arbres réels façon Google Earth), ajoutez un token <strong>VITE_CESIUM_ION_TOKEN</strong>.
        </div>
      )}
    </div>
  );
}
