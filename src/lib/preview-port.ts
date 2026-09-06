export function parsePreviewPort(rawPort: string): number {
  if (!/^\d{1,5}$/.test(rawPort)) {
    throw new Error(
      `PW_PORT must be an integer from 1 to 65535; received ${JSON.stringify(rawPort)}`,
    );
  }

  const port = Number(rawPort);
  if (port < 1 || port > 65535) {
    throw new Error(`PW_PORT must be an integer from 1 to 65535; received ${rawPort}`);
  }
  return port;
}
