import { fireEvent, render } from '@testing-library/react-native';

import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';
import MeritDedicationScreen from '@/app/tradition/buddhist-prayer/merit';

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    Stack: {
      Screen: () => null,
    },
    useRouter: () => ({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    }),
  };
});

describe('merit dedication screen', () => {
  beforeEach(() => {
    useBuddhistPrayerStore.getState().resetSession();
  });

  it('renders an optional dedication note input and stores the note', () => {
    const { getByPlaceholderText, getByText } = render(<MeritDedicationScreen />);

    expect(getByText('Optional dedication note')).toBeTruthy();

    const input = getByPlaceholderText('Offer a name, prayer, or intention…');
    fireEvent.changeText(input, 'May this practice benefit my family.');

    expect(useBuddhistPrayerStore.getState().dedicationNote).toBe(
      'May this practice benefit my family.',
    );
  });
});
