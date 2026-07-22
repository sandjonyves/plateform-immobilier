/**
 * Chargement optimisé de Cesium — rendu immersif type satellite / Google Earth.
 */

export const CESIUM_VERSION = '1.118';

const CDN_BASES = [
  `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium`,
  `https://unpkg.com/cesium@${CESIUM_VERSION}/Build/Cesium`,
];

/** Asset Ion : Bing Maps Aerial */
export const ION_BING_AERIAL = 2;
/** Asset Ion : Cesium World Terrain */
export const ION_WORLD_TERRAIN = 1;
/** Asset Ion : Google Photorealistic 3D Tiles (accès premium requis) */
export const ION_GOOGLE_PHOTOREAL = 2275207;

declare global {
  interface Window {
    Cesium?: any;
    CESIUM_BASE_URL?: string;
  }
}

export type NetworkTier = 'low' | 'medium' | 'high';

export interface QualityProfile {
  tier: NetworkTier;
  globeSSE: number;
  tileCacheSize: number;
  preloadSiblings: boolean;
  resolutionScale: number;
  msaa: number;
  shadows: boolean;
  hdr: boolean;
  fxaa: boolean;
  ambientOcclusion: boolean;
  requestRenderMode: boolean;
  maxRequests: number;
  maxRequestsPerServer: number;
  upgradeImagery: boolean;
  upgradeTerrain: boolean;
  loadBuildings: boolean;
  tryPhotoreal: boolean;
  photorealSSE: number;
  ionTimeoutMs: number;
  terrainTimeoutMs: number;
  buildingsTimeoutMs: number;
  gridDivisions: number;
  fogDensity: number;
}

export function detectNetworkTier(): NetworkTier {
  if (typeof navigator === 'undefined') return 'medium';
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
      downlink?: number;
    };
  };
  const c = nav.connection;
  if (c?.saveData) return 'low';
  const t = c?.effectiveType;
  if (t === 'slow-2g' || t === '2g') return 'low';
  if (t === '3g') return 'medium';
  if (typeof c?.downlink === 'number') {
    if (c.downlink < 1.2) return 'low';
    if (c.downlink < 4) return 'medium';
  }
  if (/Android|iPhone|iPad/i.test(navigator.userAgent) && !c) return 'medium';
  return 'high';
}

export function qualityForTier(tier: NetworkTier): QualityProfile {
  if (tier === 'low') {
    return {
      tier,
      globeSSE: 3.5,
      tileCacheSize: 250,
      preloadSiblings: false,
      resolutionScale: 0.85,
      msaa: 2,
      shadows: false,
      hdr: false,
      fxaa: true,
      ambientOcclusion: false,
      requestRenderMode: true,
      maxRequests: 8,
      maxRequestsPerServer: 3,
      upgradeImagery: true,
      upgradeTerrain: true,
      loadBuildings: false,
      tryPhotoreal: false,
      photorealSSE: 24,
      ionTimeoutMs: 2500,
      terrainTimeoutMs: 3500,
      buildingsTimeoutMs: 0,
      gridDivisions: 3,
      fogDensity: 0.00002,
    };
  }
  if (tier === 'medium') {
    return {
      tier,
      globeSSE: 1.75,
      tileCacheSize: 800,
      preloadSiblings: true,
      resolutionScale: Math.min(window.devicePixelRatio || 1, 1.5),
      msaa: 4,
      shadows: true,
      hdr: true,
      fxaa: true,
      ambientOcclusion: true,
      requestRenderMode: false,
      maxRequests: 14,
      maxRequestsPerServer: 5,
      upgradeImagery: true,
      upgradeTerrain: true,
      loadBuildings: true,
      tryPhotoreal: true,
      photorealSSE: 14,
      ionTimeoutMs: 4000,
      terrainTimeoutMs: 8000,
      buildingsTimeoutMs: 10000,
      gridDivisions: 4,
      fogDensity: 0.000015,
    };
  }
  return {
    tier,
    globeSSE: 1.25,
    tileCacheSize: 1400,
    preloadSiblings: true,
    resolutionScale: Math.min(window.devicePixelRatio || 1, 2),
    msaa: 8,
    shadows: true,
    hdr: true,
    fxaa: true,
    ambientOcclusion: true,
    requestRenderMode: false,
    maxRequests: 22,
    maxRequestsPerServer: 8,
    upgradeImagery: true,
    upgradeTerrain: true,
    loadBuildings: true,
    tryPhotoreal: true,
    photorealSSE: 8,
    ionTimeoutMs: 5000,
    terrainTimeoutMs: 10000,
    buildingsTimeoutMs: 15000,
    gridDivisions: 5,
    fogDensity: 0.00001,
  };
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  if (ms <= 0) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

function loadScript(src: string, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && window.Cesium) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    const timer = setTimeout(() => {
      s.remove();
      reject(new Error('Timeout chargement Cesium'));
    }, timeoutMs);
    s.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    s.onerror = () => {
      clearTimeout(timer);
      s.remove();
      reject(new Error(`Échec script ${src}`));
    };
    document.head.appendChild(s);
  });
}

function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = href;
  css.media = 'print';
  css.onload = () => {
    css.media = 'all';
  };
  document.head.appendChild(css);
}

let loadPromise: Promise<any> | null = null;

export function prefetchCesium() {
  if (typeof window === 'undefined' || window.Cesium || loadPromise) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = `${CDN_BASES[0]}/Cesium.js`;
  document.head.appendChild(link);
}

export function loadCesium(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.Cesium) return Promise.resolve(window.Cesium);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    let lastError: Error | null = null;
    for (const base of CDN_BASES) {
      try {
        window.CESIUM_BASE_URL = `${base}/`;
        loadCss(`${base}/Widgets/widgets.css`);
        await loadScript(`${base}/Cesium.js`, 18000);
        if (window.Cesium) return window.Cesium;
      } catch (e) {
        lastError = e as Error;
      }
    }
    throw lastError ?? new Error('Échec du chargement de CesiumJS');
  })();

  return loadPromise;
}

/** Imagerie de secours rapide (OSM) — remplacée ensuite par l'aérien. */
export function createFastImagery(Cesium: any) {
  return new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  });
}

export function applyRequestLimits(Cesium: any, profile: QualityProfile) {
  if (Cesium.RequestScheduler) {
    Cesium.RequestScheduler.maximumRequests = profile.maxRequests;
    Cesium.RequestScheduler.maximumRequestsPerServer = profile.maxRequestsPerServer;
  }
}

/**
 * Qualité visuelle : éclairage soleil, atmosphère, ombres, AA, AO, fog léger.
 */
export function applySceneQuality(viewer: any, Cesium: any, profile: QualityProfile) {
  const scene = viewer.scene;
  viewer.resolutionScale = profile.resolutionScale;

  // Ombres globe + entités
  viewer.shadows = profile.shadows;
  if (profile.shadows) {
    viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
    const sm = scene.shadowMap;
    sm.softShadows = true;
    sm.size = profile.tier === 'high' ? 4096 : profile.tier === 'medium' ? 2048 : 1024;
    sm.maximumDistance = 12000;
    sm.darkness = 0.55;
  }

  // Anti-aliasing
  if (scene.postProcessStages?.fxaa) {
    scene.postProcessStages.fxaa.enabled = profile.fxaa;
  }
  if (scene.msaaSamples !== undefined) {
    scene.msaaSamples = profile.msaa;
  }
  if (scene.highDynamicRange !== undefined) {
    scene.highDynamicRange = profile.hdr;
  }

  // Ambient occlusion (profondeur visuelle)
  const ao = scene.postProcessStages?.ambientOcclusion;
  if (ao) {
    ao.enabled = profile.ambientOcclusion;
    if (profile.ambientOcclusion && ao.uniforms) {
      ao.uniforms.intensity = profile.tier === 'high' ? 3.0 : 2.2;
      ao.uniforms.bias = 0.1;
      ao.uniforms.lengthCap = 0.45;
      ao.uniforms.stepSize = 1.2;
      ao.uniforms.frustumLength = 1000;
    }
  }

  // Globe / relief
  scene.globe.maximumScreenSpaceError = profile.globeSSE;
  scene.globe.tileCacheSize = profile.tileCacheSize;
  scene.globe.preloadSiblings = profile.preloadSiblings;
  scene.globe.preloadAncestors = true;
  scene.globe.depthTestAgainstTerrain = true;
  scene.globe.enableLighting = true;
  scene.globe.dynamicAtmosphereLighting = true;
  scene.globe.dynamicAtmosphereLightingFromSun = true;
  scene.globe.showGroundAtmosphere = true;
  scene.globe.atmosphereLightIntensity = 20.0;
  if (scene.globe.lightingFadeOutDistance !== undefined) {
    scene.globe.lightingFadeOutDistance = 3.5e7;
  }

  // Atmosphère ciel + horizon
  if (scene.skyAtmosphere) {
    scene.skyAtmosphere.show = true;
    scene.skyAtmosphere.hueShift = -0.02;
    scene.skyAtmosphere.saturationShift = 0.08;
    scene.skyAtmosphere.brightnessShift = 0.05;
  }

  // Fog très léger (évite le rendu voilé)
  scene.fog.enabled = true;
  scene.fog.density = profile.fogDensity;
  scene.fog.minimumBrightness = 0.15;

  scene.sun.show = true;
  scene.moon.show = false;
  scene.skyBox.show = true;

  if (profile.requestRenderMode) {
    scene.requestRenderMode = true;
    scene.maximumRenderTimeChange = Infinity;
  } else {
    scene.requestRenderMode = false;
  }
}

/**
 * Soleil dynamique + horodatage après-midi (ombres lisibles, pas midi plat).
 * @param hourLocal heure locale approximative (défaut 15h30)
 */
export function applySunLighting(
  viewer: any,
  Cesium: any,
  hourLocal = 15.5,
  profile?: QualityProfile,
) {
  viewer.scene.light = new Cesium.SunLight({ intensity: 2.0 });

  // Après-midi Yaoundé (UTC+1) → UTC ≈ hourLocal - 1
  const now = new Date();
  const utcHour = hourLocal - 1;
  const h = Math.floor(utcHour);
  const m = Math.round((utcHour - h) * 60);
  const afternoon = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0),
  );
  viewer.clock.currentTime = Cesium.JulianDate.fromDate(afternoon);
  viewer.clock.shouldAnimate = false;
  viewer.clock.multiplier = 1;

  if (profile?.tier === 'low') {
    // Fallback directionnel doux si ombres désactivées
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(0.35, -0.55, -0.75),
      intensity: 1.6,
    });
  }
}

/** Offset caméra immersif type Google Earth (pas vue nadir). */
export function immersiveCameraOffset(
  Cesium: any,
  range: number,
  opts?: { headingDeg?: number; pitchDeg?: number },
) {
  return new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(opts?.headingDeg ?? 35),
    Cesium.Math.toRadians(opts?.pitchDeg ?? -42),
    range,
  );
}

/**
 * Charge Bing Aerial (Ion) ou fallback ArcGIS World Imagery.
 * Retourne true si une couche aérienne a été installée.
 */
export async function upgradeToAerialImagery(
  viewer: any,
  Cesium: any,
  hasIonToken: boolean,
  timeoutMs: number,
): Promise<boolean> {
  if (hasIonToken) {
    // Prefer createWorldImageryAsync (Aerial) puis asset Bing 2
    let provider: any = null;
    if (typeof Cesium.createWorldImageryAsync === 'function') {
      provider = await withTimeout(
        Cesium.createWorldImageryAsync({
          style: Cesium.IonWorldImageryStyle?.AERIAL ?? undefined,
        }),
        timeoutMs,
      );
    }
    if (!provider) {
      provider = await withTimeout(
        Cesium.IonImageryProvider.fromAssetId(ION_BING_AERIAL),
        timeoutMs,
      );
    }
    if (!provider) {
      provider = await withTimeout(
        Cesium.IonImageryProvider.fromAssetId(3),
        timeoutMs,
      );
    }
    if (provider && !viewer.isDestroyed()) {
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(provider);
      return true;
    }
  }

  const arcgis = await withTimeout(
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures: false },
    ),
    Math.min(timeoutMs, 6000),
  );
  if (arcgis && !viewer.isDestroyed()) {
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(arcgis);
    return true;
  }
  return false;
}

/**
 * Cesium World Terrain + vertex normals (éclairage du relief).
 */
export async function upgradeToWorldTerrain(
  viewer: any,
  Cesium: any,
  hasIonToken: boolean,
  timeoutMs: number,
): Promise<boolean> {
  if (!hasIonToken) return false;

  let terrain: any = null;
  if (typeof Cesium.createWorldTerrainAsync === 'function') {
    terrain = await withTimeout(
      Cesium.createWorldTerrainAsync({
        requestVertexNormals: true,
        requestWaterMask: true,
      }),
      timeoutMs,
    );
  }
  if (!terrain) {
    terrain = await withTimeout(
      Cesium.CesiumTerrainProvider.fromIonAssetId(ION_WORLD_TERRAIN, {
        requestVertexNormals: true,
        requestWaterMask: true,
      }),
      timeoutMs,
    );
  }
  if (terrain && !viewer.isDestroyed()) {
    viewer.terrainProvider = terrain;
    return true;
  }
  return false;
}

/**
 * Photorealistic 3D Tiles (premium) ou OSM Buildings stylés (matériaux réalistes).
 * Retourne 'photoreal' | 'osm' | null
 */
export async function loadUrbanBuildings(
  viewer: any,
  Cesium: any,
  profile: QualityProfile,
): Promise<'photoreal' | 'osm' | null> {
  if (!profile.loadBuildings) return null;

  // 1) Google Photorealistic 3D Tiles (nécessite accès Ion premium / Google)
  if (profile.tryPhotoreal) {
    const tileset = await withTimeout(
      Cesium.Cesium3DTileset.fromIonAssetId(ION_GOOGLE_PHOTOREAL, {
        maximumScreenSpaceError: profile.photorealSSE,
      }),
      profile.buildingsTimeoutMs,
    );
    if (tileset && !viewer.isDestroyed()) {
      viewer.scene.primitives.add(tileset);
      return 'photoreal';
    }
  }

  // 2) Fallback OSM Buildings — couleurs bâtiment réalistes (béton / stuc)
  const buildings = await withTimeout(
    Cesium.createOsmBuildingsAsync({
      style: new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${feature['building']} === 'commercial'", "color('#c9b8a4', 1.0)"],
            ["${feature['building']} === 'industrial'", "color('#a8a29e', 1.0)"],
            ["${feature['building']} === 'apartments'", "color('#d6cfc4', 1.0)"],
            ["${feature['building']} === 'residential'", "color('#e0d6c8', 1.0)"],
            ["${feature['building']} === 'church'", "color('#d4c4b0', 1.0)"],
            ['true', "color('#cfc6b8', 1.0)"],
          ],
        },
      }),
    }),
    profile.buildingsTimeoutMs,
  );
  if (buildings && !viewer.isDestroyed()) {
    viewer.scene.primitives.add(buildings);
    return 'osm';
  }
  return null;
}
