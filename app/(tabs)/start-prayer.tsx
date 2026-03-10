import { Redirect } from 'expo-router';

import { useTradition } from '@/hooks/use-tradition';

export default function StartPrayerTabScreen() {
  const { tradition } = useTradition();

  if (tradition === 'islam') {
    return <Redirect href="/tradition/islam-session" />;
  }

  return <Redirect href="/active-session" />;
}
