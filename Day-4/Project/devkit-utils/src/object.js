export const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

export const omit = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

export const isEmpty = (v) =>
  v == null || (typeof v === 'object' && Object.keys(v).length === 0) || v === '';

export const deepClone = (obj) => structuredClone(obj);