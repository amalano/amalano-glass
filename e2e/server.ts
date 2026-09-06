import { parsePreviewPort } from '../src/lib/preview-port';

export const PREVIEW_PORT = parsePreviewPort(process.env.PW_PORT ?? '4321');
export const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
