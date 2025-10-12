/**
 * @param {AllowSharedBufferSource} buffer
 */
export function arrayBufferToJSON(buffer) {
  const decoder = new TextDecoder('utf-8');
  const jsonString = decoder.decode(buffer);
  return JSON.parse(jsonString);
}

/**
 * @param {AllowSharedBufferSource} buffer
 */
export function arrayBufferToText(buffer) {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(buffer);
}
