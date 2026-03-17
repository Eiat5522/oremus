import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import IslamCompletionScreen from '@/app/tradition/islam-completion';

const mockReplace = jest.fn();
const mockMarkPrayerComplete = jest.fn().mockResolvedValue(undefined);
const mockRecordPrayerCompletion = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    replace: mockReplace,
  }),
  useLocalSearchParams: () => ({
    prayerName: 'isha',
    durationSeconds: '120',
  }),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: object) => {
    const mockReact = jest.requireActual('react');
    const mockReactNative = jest.requireActual('react-native');
    return mockReact.createElement(mockReactNative.View, props);
  },
}));
jest.mock('@/lib/islam-prayer-completion', () => ({
  markPrayerComplete: (...args: unknown[]) => mockMarkPrayerComplete(...args),
}));
jest.mock('@/lib/focus-gate', () => ({
  recordPrayerCompletion: (...args: unknown[]) => mockRecordPrayerCompletion(...args),
}));

describe('IslamCompletionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not repeat completion side effects when returning to the prayer list', async () => {
    const { getByText } = render(<IslamCompletionScreen />);

    await waitFor(() => {
      expect(mockMarkPrayerComplete).toHaveBeenCalledTimes(1);
    });
    expect(mockRecordPrayerCompletion).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Return to Prayer List'));

    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/prayers');
    expect(mockMarkPrayerComplete).toHaveBeenCalledTimes(1);
    expect(mockRecordPrayerCompletion).toHaveBeenCalledTimes(1);
  });
});
