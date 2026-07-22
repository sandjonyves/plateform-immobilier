import { useEffect, useRef, useState, useCallback } from 'react';
import { Home, MapPin, X, BedDouble, Maximize2, Building2 } from 'lucide-react';
import {
  loadCesium,
  detectNetworkTier,
  qualityForTier,
  withTimeout,
  createFastImagery,
  applyRequestLimits,
  applySceneQuality,
  applySunLighting,
  immersiveCameraOffset,
  upgradeToAerialImagery,
  upgradeToWorldTerrain,
  loadUrbanBuildings,
  type QualityProfile,
} from '@/lib/cesium-loader';

declare global { interface Window { Cesium?: any; CESIUM_BASE_URL?: string; } }

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
  /** Détails maison pour le rendu 3D */
  surface_m2?: number;
  chambres?: number;
  etages?: number;
  typeBien?: string;
  salles_de_bain?: number;
}

export interface CesiumMapProps {
  parcelles: ParcelleMarker[];
  hauteurExtrusion?: number;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  showOverlay?: boolean;
}

const STATUT_HEX: Record<string, string> = {
  disponible: '#16a34a',
  en_negociation: '#f59e0b',
  vendu: '#dc2626',
  loue: '#2563eb',
  en_travaux: '#a855f7',
  archive: '#737373',
};

const STATUT_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  en_negociation: 'En négociation',
  vendu: 'Vendu',
  loue: 'Loué',
  en_travaux: 'En travaux',
  archive: 'Archivé',
};

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

/** Empreinte au sol (degrés) approximée depuis la surface m² */
function footprintHalfSize(surfaceM2: number): number {
  const side = Math.sqrt(Math.max(surfaceM2, 40));
  // ~111_320 m par degré latitude
  return (side / 2) / 111_320;
}

/** Positions lon/lat sans altitude → pour clamp au sol */
function groundPositions(
  Cesium: any,
  pts: { latitude: number; longitude: number }[],
) {
  return pts.map((b) => Cesium.Cartesian3.fromDegrees(b.longitude, b.latitude));
}

/** Cadrillage interne (bbox du polygone) */
function terrainGridLines(
  Cesium: any,
  bornes: { latitude: number; longitude: number }[],
  divisions = 4,
) {
  const lats = bornes.map((b) => b.latitude);
  const lngs = bornes.map((b) => b.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const lines: ReturnType<typeof groundPositions>[] = [];

  for (let i = 1; i < divisions; i++) {
    const t = i / divisions;
    const lat = minLat + (maxLat - minLat) * t;
    const lng = minLng + (maxLng - minLng) * t;
    lines.push([
      Cesium.Cartesian3.fromDegrees(minLng, lat),
      Cesium.Cartesian3.fromDegrees(maxLng, lat),
    ]);
    lines.push([
      Cesium.Cartesian3.fromDegrees(lng, minLat),
      Cesium.Cartesian3.fromDegrees(lng, maxLat),
    ]);
  }
  return lines;
}

function createMaisonBillboard(Cesium: any, colorHex: string, isMaison: boolean): HTMLCanvasElement {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Halo
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, colorHex + 'cc');
  grad.addColorStop(0.55, colorHex + '55');
  grad.addColorStop(1, colorHex + '00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Pin circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 - 2, 16, 0, Math.PI * 2);
  ctx.fillStyle = colorHex;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Icon (house or terrain)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  if (isMaison) {
    ctx.beginPath();
    ctx.moveTo(32, 20);
    ctx.lineTo(42, 28);
    ctx.lineTo(42, 40);
    ctx.lineTo(22, 40);
    ctx.lineTo(22, 28);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(32, 18);
    ctx.lineTo(38, 36);
    ctx.lineTo(26, 36);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(32, 38, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

export function CesiumMap({
  parcelles,
  hauteurExtrusion = 30,
  selectedId = null,
  onSelect,
  showOverlay = true,
}: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const handlerRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [hasIonToken, setHasIonToken] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementLabel, setEnhancementLabel] = useState('');
  const [buildingsMode, setBuildingsMode] = useState<'photoreal' | 'osm' | null>(null);
  const [networkTier, setNetworkTier] = useState<QualityProfile['tier']>('medium');
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const qualityRef = useRef<QualityProfile>(qualityForTier(detectNetworkTier()));
  const initialFlyDone = useRef(false);

  const activeId = selectedId !== undefined && selectedId !== null ? selectedId : internalSelected;
  const selectedParcelle = parcelles.find((p) => p.id === activeId) ?? null;

  const handleSelect = useCallback((id: string | null) => {
    setInternalSelected(id);
    onSelectRef.current?.(id);
  }, []);

  // Init viewer — affichage rapide puis amélioration progressive (satellite / terrain / 3D)
  useEffect(() => {
    let cancelled = false;
    initialFlyDone.current = false;
    const profile = qualityForTier(detectNetworkTier());
    qualityRef.current = profile;
    setNetworkTier(profile.tier);

    loadCesium().then(async (Cesium) => {
      if (cancelled || !containerRef.current) return;
      try {
        applyRequestLimits(Cesium, profile);

        const tokenPromise = (async () => {
          try {
            const { getCesiumConfig } = await import('@/lib/cesium.functions');
            const cfg = await getCesiumConfig();
            return cfg.token || null;
          } catch {
            return null;
          }
        })();

        // ——— Étape 1 : viewer immédiat (OSM) puis upgrade aérien ———
        const fastImagery = createFastImagery(Cesium);
        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayer: new Cesium.ImageryLayer(fastImagery),
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          baseLayerPicker: false,
          geocoder: false,
          timeline: false,
          animation: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          homeButton: false,
          infoBox: false,
          selectionIndicator: profile.tier === 'high',
          fullscreenButton: true,
          requestRenderMode: profile.requestRenderMode,
          maximumRenderTimeChange: Infinity,
          msaaSamples: profile.msaa,
          creditContainer: document.createElement('div'),
          targetFrameRate: profile.tier === 'low' ? 30 : 60,
          shadows: profile.shadows,
        });

        applySceneQuality(viewer, Cesium, profile);
        applySunLighting(viewer, Cesium, 15.5, profile);

        viewerRef.current = viewer;
        setReady(true);

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handlerRef.current = handler;
        handler.setInputAction((evt: any) => {
          const picked = viewer.scene.pick(evt.position);
          const entity = picked?.id;
          let parcelleId: string | null = null;
          if (entity?.properties?.parcelleId) {
            parcelleId = entity.properties.parcelleId.getValue(Cesium.JulianDate.now());
          } else if (typeof entity?.id === 'string') {
            const raw = entity.id as string;
            const suffixes = ['-borne-', '-pin', '-label', '-ring', '-box', '-roof', '-outline', '-corridor', '-grid-', '-edge-', '-footprint'];
            let found = false;
            for (const s of suffixes) {
              if (raw.includes(s)) {
                parcelleId = raw.split(s)[0];
                found = true;
                break;
              }
            }
            if (!found) parcelleId = raw;
          }
          handleSelect(parcelleId);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction((evt: any) => {
          const picked = viewer.scene.pick(evt.endPosition);
          viewer.canvas.style.cursor = picked?.id ? 'pointer' : 'default';
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // ——— Étape 2 : améliorations progressives ———
        setEnhancing(true);
        setEnhancementLabel('Chargement imagerie aérienne…');

        let ionToken = await withTimeout(tokenPromise, profile.ionTimeoutMs);
        if (!ionToken) {
          ionToken = await withTimeout(tokenPromise, 3000);
        }
        if (cancelled || viewer.isDestroyed()) return;

        if (ionToken) {
          Cesium.Ion.defaultAccessToken = ionToken;
          setHasIonToken(true);
        }

        // 2a — Imagerie aérienne HD (Bing via Ion, sinon ArcGIS)
        if (profile.upgradeImagery) {
          await upgradeToAerialImagery(
            viewer,
            Cesium,
            Boolean(ionToken),
            profile.terrainTimeoutMs,
          );
          viewer.scene.requestRender?.();
        }

        if (cancelled || viewer.isDestroyed()) return;
        setEnhancementLabel('Chargement du relief World Terrain…');

        // 2b — Cesium World Terrain + normales
        if (ionToken && profile.upgradeTerrain) {
          await upgradeToWorldTerrain(
            viewer,
            Cesium,
            true,
            profile.terrainTimeoutMs,
          );
          viewer.scene.requestRender?.();
        }

        if (cancelled || viewer.isDestroyed()) return;
        setEnhancementLabel('Chargement des bâtiments 3D…');

        // 2c — Photorealistic Tiles (premium) ou OSM Buildings
        if (ionToken) {
          const mode = await loadUrbanBuildings(viewer, Cesium, profile);
          if (!cancelled) setBuildingsMode(mode);
          viewer.scene.requestRender?.();
        }

        // Ré-appliquer soleil / qualité après les providers lourds
        applySunLighting(viewer, Cesium, 15.5, profile);
        applySceneQuality(viewer, Cesium, profile);

        if (!cancelled) {
          setEnhancing(false);
          setEnhancementLabel('');
        }
      } catch (e) {
        setError((e as Error).message);
        setEnhancing(false);
      }
    }).catch((e) => {
      setError(e.message);
      setEnhancing(false);
    });

    return () => {
      cancelled = true;
      if (handlerRef.current && !handlerRef.current.isDestroyed?.()) {
        try { handlerRef.current.destroy(); } catch { /* noop */ }
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try { viewerRef.current.destroy(); } catch { /* noop */ }
      }
      viewerRef.current = null;
    };
  }, [handleSelect]);

  // Sync parcelles → entités 3D
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium || !ready) return;
    const Cesium = window.Cesium;
    viewer.entities.removeAll();

    const billboardCache: Record<string, HTMLCanvasElement> = {};

    parcelles.forEach((p) => {
      const hex = STATUT_HEX[p.statut] ?? '#737373';
      const color = Cesium.Color.fromCssColorString(hex);
      const isSelected = p.id === activeId;
      const props = {
        parcelleId: p.id,
        type: p.type,
        titre: p.titre,
      };

      if (p.type === 'terrain' && p.bornes && p.bornes.length >= 3) {
        const flat: number[] = [];
        p.bornes.forEach((b) => { flat.push(b.longitude, b.latitude); });
        const closed = [...p.bornes, p.bornes[0]];
        const outlinePos = groundPositions(Cesium, closed);
        const edgeWidth = isSelected ? 7 : 5;

        // 1) Remplissage drapé sur le sol / tuiles 3D (pas d'extrusion → plus de dérive)
        viewer.entities.add({
          id: p.id,
          name: p.titre,
          properties: props,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flat),
            material: color.withAlpha(isSelected ? 0.55 : 0.38),
            classificationType: Cesium.ClassificationType.BOTH,
            outline: false,
          },
        });

        // 2) Contour principal : traits reliant B1→B2→…→B1, collés au sol
        // (matériau simple obligatoire : glow/outline non supportés avec clampToGround)
        viewer.entities.add({
          id: `${p.id}-outline`,
          properties: props,
          polyline: {
            positions: outlinePos,
            width: edgeWidth,
            clampToGround: true,
            arcType: Cesium.ArcType.GEODESIC,
            material: color,
            zIndex: 10,
          },
        });

        // 3) Bande corridor (bordure épaisse) — sauté en mode low pour économiser
        if (qualityRef.current.tier !== 'low') {
          viewer.entities.add({
            id: `${p.id}-corridor`,
            properties: props,
            corridor: {
              positions: outlinePos,
              width: isSelected ? 3.5 : 2.2,
              material: color.withAlpha(0.85),
              clampToGround: true,
              cornerType: Cesium.CornerType.MITERED,
              classificationType: Cesium.ClassificationType.BOTH,
              zIndex: 8,
            },
          });
        }

        // 4) Cadrillage interne collé au sol
        if (qualityRef.current.tier !== 'low' || isSelected) {
          terrainGridLines(Cesium, p.bornes, isSelected ? qualityRef.current.gridDivisions + 1 : qualityRef.current.gridDivisions).forEach((line, gi) => {
            viewer.entities.add({
              id: `${p.id}-grid-${gi}`,
              properties: props,
              polyline: {
                positions: line,
                width: isSelected ? 2.5 : 1.5,
                clampToGround: true,
                arcType: Cesium.ArcType.GEODESIC,
                material: color.withAlpha(0.55),
                zIndex: 5,
              },
            });
          });
        }

        // 5) Centroïde + pin / label ancrés au sol
        const cLat = p.bornes.reduce((s, b) => s + b.latitude, 0) / p.bornes.length;
        const cLng = p.bornes.reduce((s, b) => s + b.longitude, 0) / p.bornes.length;
        const cacheKey = `t-${hex}`;
        if (!billboardCache[cacheKey]) {
          billboardCache[cacheKey] = createMaisonBillboard(Cesium, hex, false);
        }

        viewer.entities.add({
          id: `${p.id}-pin`,
          properties: props,
          position: Cesium.Cartesian3.fromDegrees(cLng, cLat),
          billboard: {
            image: billboardCache[cacheKey],
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            scale: isSelected ? 1.15 : 0.9,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(100, 1.2, 20000, 0.4),
          },
          label: {
            text: `${p.titre}\n${xaf(p.prix)}`,
            font: '600 13px Inter, system-ui, sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(0, -48),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.78),
            backgroundPadding: new Cesium.Cartesian2(10, 6),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(200, 1.1, 25000, 0.35),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 45000),
          },
        });

        // 6) Bornes B1…Bn ancrées au sol + segments individuels bien nets
        p.bornes.forEach((b, i) => {
          const next = p.bornes![(i + 1) % p.bornes!.length];
          viewer.entities.add({
            id: `${p.id}-edge-${i}`,
            properties: props,
            polyline: {
              positions: groundPositions(Cesium, [b, next]),
              width: edgeWidth + 1,
              clampToGround: true,
              arcType: Cesium.ArcType.GEODESIC,
              material: Cesium.Color.WHITE.withAlpha(0.95),
              zIndex: 12,
            },
          });

          viewer.entities.add({
            id: `${p.id}-borne-${i}`,
            properties: props,
            position: Cesium.Cartesian3.fromDegrees(b.longitude, b.latitude),
            point: {
              pixelSize: isSelected ? 14 : 11,
              color: Cesium.Color.WHITE,
              outlineColor: color,
              outlineWidth: 3,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              scaleByDistance: new Cesium.NearFarScalar(50, 1.3, 8000, 0.6),
            },
            label: {
              text: `B${i + 1}`,
              font: '700 12px Inter, sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000),
            },
          });
        });
      } else if (p.point) {
        // ——— Maisons : bâtiment 3D + pin + anneau ———
        const { latitude: lat, longitude: lng } = p.point;
        const floors = Math.max(1, p.etages ?? 1);
        const typeBoost: Record<string, number> = {
          villa: 9, duplex: 11, appartement: 16, bureau: 18, studio: 7,
        };
        const buildingHeight = Math.max(
          typeBoost[p.typeBien ?? ''] ?? 10,
          floors * 4.5,
        );
        const half = footprintHalfSize(p.surface_m2 ?? 120);
        const halfLng = half / Math.max(0.3, Math.cos((lat * Math.PI) / 180));

        const boxPositions = [
          lng - halfLng, lat - half,
          lng + halfLng, lat - half,
          lng + halfLng, lat + half,
          lng - halfLng, lat + half,
        ];

        // Volume bâtiment extrudé — matériau type béton/stuc, accent statut sur le contour
        const wallColor = Cesium.Color.fromCssColorString('#d8d0c4').withAlpha(isSelected ? 0.95 : 0.88);
        viewer.entities.add({
          id: `${p.id}-box`,
          name: p.titre,
          properties: props,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(boxPositions),
            material: wallColor,
            height: 0,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            extrudedHeight: buildingHeight,
            extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            outline: true,
            outlineColor: color.withAlpha(0.95),
            outlineWidth: isSelected ? 3 : 2,
            shadows: Cesium.ShadowMode.ENABLED,
            closeTop: true,
            closeBottom: true,
          },
        });

        // Contour lumineux du toit
        const roofLoop = [
          [lng - halfLng, lat - half],
          [lng + halfLng, lat - half],
          [lng + halfLng, lat + half],
          [lng - halfLng, lat + half],
          [lng - halfLng, lat - half],
        ];
        viewer.entities.add({
          id: `${p.id}-roof`,
          properties: props,
          polyline: {
            positions: roofLoop.map(([lo, la]) =>
              Cesium.Cartesian3.fromDegrees(lo, la, buildingHeight + 0.5),
            ),
            width: isSelected ? 4 : 2.5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: color,
            }),
          },
        });

        // Anneau au sol drapé
        viewer.entities.add({
          id: `${p.id}-ring`,
          properties: props,
          position: Cesium.Cartesian3.fromDegrees(lng, lat),
          ellipse: {
            semiMajorAxis: Math.max(22, Math.sqrt(p.surface_m2 ?? 100) * 1.4),
            semiMinorAxis: Math.max(22, Math.sqrt(p.surface_m2 ?? 100) * 1.4),
            material: color.withAlpha(isSelected ? 0.4 : 0.22),
            outline: true,
            outlineColor: color,
            height: 0,
            classificationType: Cesium.ClassificationType.BOTH,
          },
        });

        // Empreinte au sol + contour clampé
        const houseLoop = [
          { longitude: lng - halfLng, latitude: lat - half },
          { longitude: lng + halfLng, latitude: lat - half },
          { longitude: lng + halfLng, latitude: lat + half },
          { longitude: lng - halfLng, latitude: lat + half },
          { longitude: lng - halfLng, latitude: lat - half },
        ];
        viewer.entities.add({
          id: `${p.id}-footprint`,
          properties: props,
          polyline: {
            positions: groundPositions(Cesium, houseLoop),
            width: isSelected ? 4 : 3,
            clampToGround: true,
            material: color,
            zIndex: 6,
          },
        });

        const cacheKey = `m-${hex}`;
        if (!billboardCache[cacheKey]) {
          billboardCache[cacheKey] = createMaisonBillboard(Cesium, hex, true);
        }

        const meta: string[] = [];
        if (p.typeBien) meta.push(String(p.typeBien));
        if (p.chambres != null && p.chambres > 0) meta.push(`${p.chambres} ch.`);
        if (p.surface_m2) meta.push(`${p.surface_m2} m²`);

        viewer.entities.add({
          id: p.id,
          name: p.titre,
          properties: props,
          position: Cesium.Cartesian3.fromDegrees(lng, lat, buildingHeight + 5),
          billboard: {
            image: billboardCache[cacheKey],
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            scale: isSelected ? 1.3 : 1.1,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `🏠 ${p.titre}\n${xaf(p.prix)}${meta.length ? `\n${meta.join(' · ')}` : ''}`,
            font: '600 13px Inter, system-ui, sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(0, -58),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('#1e1b4b').withAlpha(0.85),
            backgroundPadding: new Cesium.Cartesian2(12, 7),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(150, 1.2, 20000, 0.4),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 45000),
          },
        });
      }
    });

    if (parcelles.length > 0 && !activeId && !initialFlyDone.current) {
      initialFlyDone.current = true;
      viewer.flyTo(viewer.entities, {
        duration: 2.6,
        offset: immersiveCameraOffset(Cesium, 0, {
          headingDeg: 42,
          pitchDeg: -48,
        }),
      });
    }

    viewer.scene.requestRender?.();
  }, [parcelles, hauteurExtrusion, ready, activeId]);

  // Fly to sélection
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !window.Cesium || !ready || !activeId) return;
    const Cesium = window.Cesium;
    const p = parcelles.find((x) => x.id === activeId);
    if (!p) return;

    const entity =
      viewer.entities.getById(activeId) ||
      viewer.entities.getById(`${activeId}-box`) ||
      viewer.entities.getById(`${activeId}-pin`);

    if (entity) {
      viewer.flyTo(entity, {
        duration: 1.8,
        offset: immersiveCameraOffset(
          Cesium,
          p.type === 'maison' ? 220 : 480,
          { headingDeg: 38, pitchDeg: -46 },
        ),
      });
    }
  }, [activeId, ready, parcelles, hauteurExtrusion]);

  return (
    <div className="relative w-full h-full min-h-[320px]">
      <div ref={containerRef} className="absolute inset-0 cesium-map-root" />

      {!ready && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground bg-card/85 backdrop-blur-sm z-10">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-center">
            <div>Chargement rapide de la carte…</div>
            <div className="text-[11px] mt-1 opacity-80">
              Mode {networkTier === 'low' ? 'économie de données' : networkTier === 'medium' ? 'équilibré' : 'qualité'}
            </div>
          </div>
        </div>
      )}

      {ready && enhancing && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 text-[10px] bg-card/90 backdrop-blur border border-border rounded-md px-2.5 py-1.5 text-muted-foreground shadow-sm">
          <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          {enhancementLabel || 'Amélioration de la qualité…'}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-danger bg-card z-10 px-4 text-center">
          Erreur Cesium : {error}
        </div>
      )}

      {/* Overlay détail sélection */}
      {ready && showOverlay && selectedParcelle && (
        <div className="absolute top-3 right-3 z-20 w-[min(100%-1.5rem,320px)] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden">
            <div
              className="h-1.5 w-full"
              style={{ background: STATUT_HEX[selectedParcelle.statut] ?? '#737373' }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
                    style={{ background: STATUT_HEX[selectedParcelle.statut] ?? '#737373' }}
                  >
                    {selectedParcelle.type === 'maison' ? <Home size={16} /> : <MapPin size={16} />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {selectedParcelle.type === 'maison' ? 'Maison' : 'Terrain'}
                      {selectedParcelle.typeBien ? ` · ${selectedParcelle.typeBien}` : ''}
                    </div>
                    <h3 className="font-display font-bold text-sm leading-snug truncate">
                      {selectedParcelle.titre}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="shrink-0 p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Fermer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: STATUT_HEX[selectedParcelle.statut] ?? '#737373' }}
                >
                  {STATUT_LABEL[selectedParcelle.statut] ?? selectedParcelle.statut}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedParcelle.quartier}, {selectedParcelle.ville}
                </span>
              </div>

              <div className="mt-3 font-display text-xl font-bold text-primary">
                {xaf(selectedParcelle.prix)}
              </div>

              {(selectedParcelle.surface_m2 != null || selectedParcelle.chambres != null || selectedParcelle.etages != null) && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {selectedParcelle.surface_m2 != null && (
                    <div className="rounded-lg bg-secondary/80 px-2 py-1.5 text-center">
                      <Maximize2 size={12} className="mx-auto text-muted-foreground mb-0.5" />
                      <div className="text-xs font-semibold">{selectedParcelle.surface_m2} m²</div>
                    </div>
                  )}
                  {selectedParcelle.chambres != null && selectedParcelle.chambres > 0 && (
                    <div className="rounded-lg bg-secondary/80 px-2 py-1.5 text-center">
                      <BedDouble size={12} className="mx-auto text-muted-foreground mb-0.5" />
                      <div className="text-xs font-semibold">{selectedParcelle.chambres} ch.</div>
                    </div>
                  )}
                  {selectedParcelle.etages != null && (
                    <div className="rounded-lg bg-secondary/80 px-2 py-1.5 text-center">
                      <Building2 size={12} className="mx-auto text-muted-foreground mb-0.5" />
                      <div className="text-xs font-semibold">{selectedParcelle.etages} ét.</div>
                    </div>
                  )}
                </div>
              )}

              {selectedParcelle.point && (
                <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                  {selectedParcelle.point.latitude.toFixed(5)}, {selectedParcelle.point.longitude.toFixed(5)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {ready && !hasIonToken && !enhancing && (
        <div className="absolute top-3 left-3 max-w-[260px] text-[10px] leading-tight bg-card/90 backdrop-blur border border-border rounded-md px-2 py-1.5 text-muted-foreground z-10">
          Imagerie ArcGIS (fallback). Token Cesium Ion recommandé pour Bing Aerial + World Terrain + bâtiments 3D.
        </div>
      )}

      {ready && hasIonToken && !enhancing && buildingsMode === 'osm' && (
        <div className="absolute top-3 left-3 max-w-[280px] text-[10px] leading-tight bg-card/90 backdrop-blur border border-border rounded-md px-2 py-1.5 text-muted-foreground z-10">
          Bing Aerial + World Terrain + bâtiments OSM. Photorealistic 3D Tiles indisponibles (accès premium Google).
        </div>
      )}

      {ready && hasIonToken && !enhancing && buildingsMode === 'photoreal' && (
        <div className="absolute top-3 left-3 max-w-[240px] text-[10px] leading-tight bg-card/90 backdrop-blur border border-border rounded-md px-2 py-1.5 text-muted-foreground z-10">
          Mode Photorealistic 3D Tiles actif.
        </div>
      )}

      {ready && hasIonToken && !enhancing && networkTier === 'low' && !buildingsMode && (
        <div className="absolute top-3 left-3 max-w-[240px] text-[10px] leading-tight bg-card/90 backdrop-blur border border-border rounded-md px-2 py-1.5 text-muted-foreground z-10">
          Connexion lente détectée : qualité réduite pour un affichage plus rapide.
        </div>
      )}
    </div>
  );
}
