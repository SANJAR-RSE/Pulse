// PULSE design tokens — one source for every screen. Blue is sampled from
// the PULSE logo so the app, icon and splash read as one brand.
export const colors = {
  primary: '#2570F4',
  primaryDark: '#1D5BD0',
  primarySoft: '#E9F0FE',
  bg: '#F5F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  textSoft: '#334155',
  muted: '#64748B',
  border: '#E6EAF0',
  success: '#059669',
  successSoft: '#ECFDF5',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;

export const font = {
  h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.textSoft },
  small: { fontSize: 13, color: colors.muted },
  tiny: { fontSize: 11, color: colors.muted },
  stat: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4, color: colors.text },
};

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
