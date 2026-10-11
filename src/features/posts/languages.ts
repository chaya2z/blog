export const langs = ['en', 'ja'] as const;

export type Lang = (typeof langs)[number];

export function isLang(value: string): value is Lang {
  return (langs as readonly string[]).includes(value);
}
