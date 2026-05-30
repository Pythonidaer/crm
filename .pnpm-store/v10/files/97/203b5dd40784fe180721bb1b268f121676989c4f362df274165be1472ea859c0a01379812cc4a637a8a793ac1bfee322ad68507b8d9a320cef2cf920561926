/**
 * Typography scale constants — mirrors tokens.css.
 * Import these for programmatic access; use CSS vars in stylesheets.
 */

export const fontFamily = {
  base: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
} as const;

export const fontSize = {
  display: 'clamp(2.75rem, 2.2rem + 2vw, 4.5rem)',
  h1: 'clamp(2.5rem, 2.1rem + 1.8vw, 4rem)',
  h2: 'clamp(2rem, 1.75rem + 1.2vw, 3rem)',
  h3: 'clamp(1.75rem, 1.5rem + 0.8vw, 2.25rem)',
  h4: 'clamp(1.5rem, 1.35rem + 0.5vw, 1.875rem)',
  h5: 'clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)',
  h6: 'clamp(1.125rem, 1.05rem + 0.25vw, 1.25rem)',
  bodyLg: 'clamp(1.125rem, 1.05rem + 0.2vw, 1.25rem)',
  bodyMd: 'clamp(1rem, 0.98rem + 0.1vw, 1.125rem)',
  bodySm: 'clamp(0.875rem, 0.86rem + 0.05vw, 1rem)',
  caption: '0.75rem',
  eyebrow: '0.6875rem',
  // Legacy aliases
  xs: '0.75rem',
  sm: 'clamp(0.875rem, 0.86rem + 0.05vw, 1rem)',
  base: 'clamp(1rem, 0.98rem + 0.1vw, 1.125rem)',
  lg: 'clamp(1.125rem, 1.05rem + 0.2vw, 1.25rem)',
  xl: 'clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)',
  '2xl': 'clamp(1.5rem, 1.35rem + 0.5vw, 1.875rem)',
  '3xl': 'clamp(1.75rem, 1.5rem + 0.8vw, 2.25rem)',
  '4xl': 'clamp(2rem, 1.75rem + 1.2vw, 3rem)',
  '5xl': 'clamp(2.5rem, 2.1rem + 1.8vw, 4rem)',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  display: 1.05,
  heading: 1.15,
  body: 1.65,
  tight: 1.05,
  snug: 1.15,
  normal: 1.4,
  relaxed: 1.65,
  loose: 1.75,
} as const;

export const letterSpacing = {
  eyebrow: '0.12em',
  tight: '-0.02em',
} as const;

export const typeScale = {
  display: {
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  eyebrow: {
    fontSize: fontSize.eyebrow,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.eyebrow,
  },
  h1: { fontSize: fontSize.h1, lineHeight: lineHeight.heading, fontWeight: fontWeight.semibold },
  h2: { fontSize: fontSize.h2, lineHeight: lineHeight.heading, fontWeight: fontWeight.semibold },
  h3: { fontSize: fontSize.h3, lineHeight: lineHeight.heading, fontWeight: fontWeight.semibold },
  h4: { fontSize: fontSize.h4, lineHeight: lineHeight.normal, fontWeight: fontWeight.semibold },
  h5: { fontSize: fontSize.h5, lineHeight: lineHeight.normal, fontWeight: fontWeight.semibold },
  h6: { fontSize: fontSize.h6, lineHeight: lineHeight.normal, fontWeight: fontWeight.semibold },
  bodyLarge: { fontSize: fontSize.bodyLg, lineHeight: lineHeight.body, fontWeight: fontWeight.regular },
  body: { fontSize: fontSize.bodyMd, lineHeight: lineHeight.body, fontWeight: fontWeight.regular },
  small: { fontSize: fontSize.bodySm, lineHeight: lineHeight.body, fontWeight: fontWeight.regular },
} as const;

export type TypeScaleKey = keyof typeof typeScale;
export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
