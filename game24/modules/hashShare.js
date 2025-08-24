export function writeHash(state){
  const json = JSON.stringify(state);
  const packed = LZString.compressToEncodedURIComponent(json);
  const url = `${location.pathname}#s=${packed}`;
  history.replaceState(null, "", url);
}
export function loadFromHash(){
  if (!location.hash) return null;
  const m = location.hash.slice(1).match(/(?:^|&)s=([^&]+)/);
  if (!m) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(m[1]);
    if (!json) return null;
    return JSON.parse(json);
  } catch { return null; }
}
