import { environment } from '../../../environments/environment';

/** Превращает `/api/...` в полный URL на проде; в dev оставляет как есть. */
export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    return path;
  }

  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return base ? `${base}${path}` : path;
}
