export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function inferDirFromLang(lang) {
  return /^(ar|he|fa|ur)(-|$)/.test(lang || '') ? 'rtl' : 'auto';
}

export function toggleBadges(status, { badgeVerification, badgeAttributed, badgeMisattr }) {
  badgeVerification.hidden = badgeAttributed.hidden = badgeMisattr.hidden = true;
  if (status === 'verified') badgeVerification.hidden = false;
  else if (status === 'misattributed') badgeMisattr.hidden = false;
  else badgeAttributed.hidden = false; // attributed/unknown
}

export function nextIdFrom(queue) {
  if (!queue || queue.ids.length === 0) return null;
  const id = queue.ids[queue.cursor++];
  if (queue.cursor >= queue.ids.length) queue.cursor = 0;
  return id;
}
