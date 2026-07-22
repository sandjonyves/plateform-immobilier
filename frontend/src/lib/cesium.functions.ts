import { createServerFn } from "@tanstack/react-start";

function resolveCesiumToken(): string | null {
  // Nitro / Node (serveur)
  const fromProcess =
    process.env.CESIUM_ION_TOKEN ||
    process.env.VITE_CESIUM_ION_TOKEN ||
    null;

  if (fromProcess?.trim()) return fromProcess.trim();

  // Vite (SSR / import.meta.env) — CESIUM_ est autorisé via envPrefix
  try {
    const env = import.meta.env as Record<string, string | undefined>;
    const fromMeta = env.CESIUM_ION_TOKEN || env.VITE_CESIUM_ION_TOKEN;
    if (fromMeta?.trim()) return fromMeta.trim();
  } catch {
    /* ignore */
  }

  return null;
}

export const getCesiumConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    return { token: resolveCesiumToken() };
  },
);
