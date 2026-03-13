export const BuddhistPrayerColors = {
  background: '#140F0A',
  backgroundAlt: '#1A120C',
  card: 'rgba(255,255,255,0.08)',
  cardBorder: 'rgba(224,185,110,0.28)',
  goldPrimary: '#E0B96E',
  goldSecondary: '#C89B4B',
  goldBorder: 'rgba(224,185,110,0.45)',
  textPrimary: '#F5EBD7',
  textSecondary: 'rgba(245,235,215,0.84)',
  textMuted: 'rgba(245,235,215,0.68)',
  overlayLight: 'rgba(255,255,255,0.08)',
  overlayDark: 'rgba(0,0,0,0.65)',
  danger: '#FECACA',
  success: '#BBF7D0',
} as const;

export const BuddhistPrayerGradients = {
  background: ['rgba(20,15,10,0.0)', 'rgba(20,15,10,0.6)', 'rgba(20,15,10,0.95)'] as [
    string,
    string,
    string,
  ],
  card: ['rgba(224,185,110,0.12)', 'rgba(200,155,75,0.06)'] as [string, string],
  button: ['#C89B4B', '#8B6328'] as [string, string],
  buttonPressed: ['#B8893B', '#7A5520'] as [string, string],
  hero: ['rgba(20,15,10,0.0)', 'rgba(20,15,10,0.85)'] as [string, string],
} as const;

export const BuddhistPrayerSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BuddhistPrayerRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;
