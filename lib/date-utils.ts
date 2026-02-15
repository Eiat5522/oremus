export function getHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-uma', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Hijri date conversion failed:', error);
    return '';
  }
}

export function formatLocalDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
