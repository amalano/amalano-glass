/**
 * Serialize data for an inline <script> element without allowing data to close
 * the element. JSON itself permits '<', U+2028, and U+2029; HTML/JS parsers give
 * those characters special meaning in this context.
 */
export function stringifyForInlineScript(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) return 'null';

  return json
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}
