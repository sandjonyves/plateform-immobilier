/**
 * Client HTTP Immopro — JWT + pagination DRF.
 */

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://127.0.0.1:8000/api/v1';

const ACCESS_KEY = 'immopro_access';
const REFRESH_KEY = 'immopro_refresh';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const b = body as Record<string, unknown>;
  if (b.error && typeof b.error === 'object') {
    const detail = (b.error as { detail?: string }).detail;
    if (detail) return detail;
  }
  if (typeof b.detail === 'string') return b.detail;
  // DRF field errors
  for (const v of Object.values(b)) {
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
    if (typeof v === 'string') return v;
  }
  return fallback;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = (await res.json()) as { access: string; refresh?: string };
    setTokens(data.access, data.refresh ?? refresh);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, formData, query } = options;
  const headers: Record<string, string> = {};

  // Ne pas forcer Content-Type sur GET (évite un préflight CORS inutile)
  if (!formData && body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const doFetch = () =>
    fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const ok = await tryRefresh();
    if (ok) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      res = await doFetch();
    }
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(extractErrorMessage(data, `Erreur HTTP ${res.status}`), res.status, data);
  }
  return data as T;
}

/** Récupère toutes les pages (page_size=100). */
export async function apiListAll<T>(path: string, options: RequestOptions = {}): Promise<T[]> {
  const pageSize = 100;
  const first = await apiRequest<Paginated<T> | T[]>(path, {
    ...options,
    query: { ...options.query, page_size: pageSize, page: 1 },
  });

  if (Array.isArray(first)) return first;

  const results = [...(first.results ?? [])];
  let next = first.next;
  while (next) {
    const page = await apiRequest<Paginated<T>>(next, { auth: options.auth ?? true });
    results.push(...(page.results ?? []));
    next = page.next;
  }
  return results;
}

export { API_BASE };
