import { fireEvent, render } from '@testing-library/react-native';

import MeritDedicationScreen from '@/app/tradition/buddhist-prayer/merit';
import { useBuddhistPrayerStore } from '@/hooks/use-buddhist-prayer-store';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => {
  return {
    Stack: {
      Screen: () => null,
    },
    useRouter: () => ({
      back: jest.fn(),
      push: mockPush,
      replace: mockReplace,
    }),
  };
});

describe('merit dedication screen', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
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

  it('allows completing the session without selecting a merit option', () => {
    const { getByText } = render(<MeritDedicationScreen />);

    fireEvent.press(getByText('Continue without Merit'));

    expect(mockPush).toHaveBeenCalledWith('/tradition/buddhist-prayer/completion');
  });

  it('returns to Buddhist home when Return Home is pressed', () => {
    const { getByText } = render(<MeritDedicationScreen />);

    fireEvent.press(getByText('Return Home'));

    expect(mockReplace).toHaveBeenCalledWith('/tradition/buddhist');
  });
});
