export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const truncate = (s, max, end = '...') =>
  s.length <= max ? s : s.slice(0, max - end.length) + end;

export const slugify = (s) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l++] !== clean[r--]) return false;
  }
  return true;
}































