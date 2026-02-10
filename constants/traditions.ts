export const TRADITION_OPTIONS = [
  {
    id: 'christianity',
    title: 'Christianity',
    description: 'Biblical prayers and scripture focus',
    icon: 'church',
    color: '#3b82f6',
    bgColor: { light: '#eff6ff', dark: 'rgba(30, 58, 138, 0.2)' },
  },
  {
    id: 'islam',
    title: 'Islam',
    description: 'Prayer times, Qibla, and Quranic focus',
    icon: 'mosque',
    color: '#10b981',
    bgColor: { light: '#ecfdf5', dark: 'rgba(6, 78, 59, 0.2)' },
  },
  {
    id: 'buddhism',
    title: 'Buddhism',
    description: 'Meditation timers and sutra chants',
    icon: 'temple.buddhist',
    color: '#f59e0b',
    bgColor: { light: '#fffbeb', dark: 'rgba(120, 53, 15, 0.2)' },
  },
] as const;

export type Tradition = (typeof TRADITION_OPTIONS)[number]['id'];

export type TraditionOption = (typeof TRADITION_OPTIONS)[number];
