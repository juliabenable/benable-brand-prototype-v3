// Prototype-only persistence for sent postcards. Real implementation will
// hit an API, but for the iteration demo we just need state to survive reloads.

const STORAGE_KEY = 'benable.postcards.v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeKey(campaignId, creatorHandle) {
  return `${campaignId}::${creatorHandle}`;
}

export function getPostcard(campaignId, creatorHandle) {
  return readAll()[makeKey(campaignId, creatorHandle)] || null;
}

export function savePostcard(campaignId, creatorHandle, postcard) {
  const all = readAll();
  all[makeKey(campaignId, creatorHandle)] = postcard;
  writeAll(all);
}

export function getPostcardCount() {
  return Object.keys(readAll()).length;
}

export function clearAllPostcards() {
  localStorage.removeItem(STORAGE_KEY);
}

const STYLE_PREF_KEY = 'benable.postcards.preferredStyle';

export function getPreferredStyle() {
  return localStorage.getItem(STYLE_PREF_KEY) || 'polaroid';
}

export function setPreferredStyle(style) {
  localStorage.setItem(STYLE_PREF_KEY, style);
}
