import { parsePreviewPort } from '../src/lib/preview-port';

export const PREVIEW_PORT = parsePreviewPort(process.env.PW_PORT ?? '4321');
export const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

const baseName = (process.env.SITE_BASE ?? '/').replace(/^\/+|\/+$/g, '');
export const PREVIEW_BASE = baseName ? `/${baseName}/` : '/';
export const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://glasses.amalano.dev';
export const PUBLIC_ROOT = new URL(PREVIEW_BASE, SITE_ORIGIN).toString();

export function sitePath(path = '/'): string {
  const suffix = path.replace(/^\/+/, '');
  return suffix ? `${PREVIEW_BASE}${suffix}` : PREVIEW_BASE;
}
