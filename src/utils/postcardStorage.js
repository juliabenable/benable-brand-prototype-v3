// Prototype-only persistence for per-creator post-campaign actions.
// Real implementation will hit an API; for the demo we just need state
// to survive reloads. Keyed by `${campaignId}::${creatorHandle}`.
//
// Note on scope: postcard / shortlist / invite are per-CREATOR, but content
// rights are licensed per-POST — so `paidRights` is a map keyed by postKey.

const STORAGE_KEY = 'benable.creatorActions.v2';

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

const EMPTY = { postcard: null, shortlisted: false, invitedNext: false, paidRights: {} };

export function getCreatorState(campaignId, creatorHandle) {
  return { ...EMPTY, ...(readAll()[makeKey(campaignId, creatorHandle)] || {}) };
}

function patchCreatorState(campaignId, creatorHandle, patch) {
  const all = readAll();
  const key = makeKey(campaignId, creatorHandle);
  all[key] = { ...EMPTY, ...(all[key] || {}), ...patch };
  writeAll(all);
}

// --- Postcard (per creator) ---
export function getPostcard(campaignId, creatorHandle) {
  return getCreatorState(campaignId, creatorHandle).postcard;
}
export function savePostcard(campaignId, creatorHandle, postcard) {
  patchCreatorState(campaignId, creatorHandle, { postcard });
}

// --- Paid rights (per post) ---
export function isPaidRights(campaignId, creatorHandle, postKey) {
  return !!getCreatorState(campaignId, creatorHandle).paidRights[postKey];
}
export function setPaidRightsForPost(campaignId, creatorHandle, postKey, value) {
  const cur = getCreatorState(campaignId, creatorHandle).paidRights || {};
  const next = { ...cur };
  if (value) next[postKey] = true;
  else delete next[postKey];
  patchCreatorState(campaignId, creatorHandle, { paidRights: next });
}
export function paidRightsCount(campaignId, creatorHandle) {
  return Object.keys(getCreatorState(campaignId, creatorHandle).paidRights || {}).length;
}

// --- Re-collab (per creator) ---
export function setShortlisted(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { shortlisted: value });
}
export function setInvitedNext(campaignId, creatorHandle, value) {
  patchCreatorState(campaignId, creatorHandle, { invitedNext: value });
}

// --- Cross-creator surface ---
// Compact relationship summary for a creator (used by the Dashboard list).
export function getRelationshipSummary(campaignId, creatorHandle) {
  const s = getCreatorState(campaignId, creatorHandle);
  const rights = Object.keys(s.paidRights || {}).length;
  return {
    thanked: !!s.postcard,
    paidRights: rights, // number of posts with paid rights
    shortlisted: !!s.shortlisted,
    invitedNext: !!s.invitedNext,
    any: !!(s.postcard || rights || s.shortlisted || s.invitedNext),
  };
}

// --- Demo helpers ---
export function getActionedCount() {
  return Object.values(readAll()).filter((s) => {
    if (!s) return false;
    const rights = s.paidRights && Object.keys(s.paidRights).length;
    return s.postcard || rights || s.shortlisted || s.invitedNext;
  }).length;
}
export function clearAllActions() {
  localStorage.removeItem(STORAGE_KEY);
}

// Back-compat aliases (CampaignDetailPage / reset FAB import these names)
export const getPostcardCount = getActionedCount;
export const clearAllPostcards = clearAllActions;

const STYLE_PREF_KEY = 'benable.postcards.preferredStyle';
export function getPreferredStyle() {
  return localStorage.getItem(STYLE_PREF_KEY) || 'polaroid';
}
export function setPreferredStyle(style) {
  localStorage.setItem(STYLE_PREF_KEY, style);
}
