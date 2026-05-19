// Prototype-only persistence for per-creator post-campaign actions.
// Real implementation will hit an API; for the demo we just need state
// to survive reloads. Keyed by `${campaignId}::${creatorHandle}`.

const STORAGE_KEY = 'benable.creatorActions.v1';

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

const EMPTY = { postcard: null, paidRights: false, shortlisted: false, invitedNext: false };

export function getCreatorState(campaignId, creatorHandle) {
  return { ...EMPTY, ...(readAll()[makeKey(campaignId, creatorHandle)] || {}) };
}

function patchCreatorState(campaignId, creatorHandle, patch) {
  const all = readAll();
  const key = makeKey(campaignId, creatorHandle);
  all[key] = { ...EMPTY, ...(all[key] || {}), ...patch };
  writeAll(all);
}

// --- Postcard ---
export function getPostcard(campaignId, creatorHandle) {
  return getCreatorState(campaignId, creatorHandle).postcard;
}
export function savePostcard(campaignId, creatorHandle, postcard) {
  patchCreatorState(campaignId, creatorHandle, { postcard });
}

// --- Paid rights ---
export function setPaidRights(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { paidRights: value });
}

// --- Re-collab ---
export function setShortlisted(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { shortlisted: value });
}
export function setInvitedNext(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { invitedNext: value });
}

// --- Demo helpers ---
// Counts creators that have *any* action taken (used by the reset FAB).
export function getActionedCount() {
  return Object.values(readAll()).filter(
    (s) => s && (s.postcard || s.paidRights || s.shortlisted || s.invitedNext)
  ).length;
}
export function clearAllActions() {
  localStorage.removeItem(STORAGE_KEY);
}

// Back-compat alias (CampaignDetailPage / reset FAB still import these names)
export const getPostcardCount = getActionedCount;
export const clearAllPostcards = clearAllActions;

const STYLE_PREF_KEY = 'benable.postcards.preferredStyle';
export function getPreferredStyle() {
  return localStorage.getItem(STYLE_PREF_KEY) || 'polaroid';
}
export function setPreferredStyle(style) {
  localStorage.setItem(STYLE_PREF_KEY, style);
}
