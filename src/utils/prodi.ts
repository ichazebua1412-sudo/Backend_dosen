const PRODI_ALIASES: Record<string, string> = {
  "teknik informatika": "s1 teknik informatika",
  "s1 teknik informatika": "s1 teknik informatika",
  informatika: "s1 teknik informatika",
  "s1 informatika": "s1 teknik informatika",
  "sistem informasi": "s1 sistem informasi",
  "s1 sistem informasi": "s1 sistem informasi",
  "teknologi informasi": "s1 teknologi informasi",
  "s1 teknologi informasi": "s1 teknologi informasi",
  "manajemen informatika": "s1 manajemen informatika",
  "s1 manajemen informatika": "s1 manajemen informatika",
  "d3 manajemen informatika": "s1 manajemen informatika",
};

export function canonicalProdiKey(prodi?: string | null): string {
  const trimmed = (prodi || "").trim().toLowerCase();
  if (!trimmed) return "";
  if (PRODI_ALIASES[trimmed]) return PRODI_ALIASES[trimmed];
  if (/^(s[1-3]|d[1-4])\s+/i.test(trimmed)) return trimmed;
  return `s1 ${trimmed}`;
}

export function isSameProdi(prodiA?: string | null, prodiB?: string | null): boolean {
  const keyA = canonicalProdiKey(prodiA);
  const keyB = canonicalProdiKey(prodiB);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
}
