import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import OnboardingScreen from '@/app/onboarding/index';
import { getTraditionUiTheme } from '@/constants/tradition-ui';

const mockReactNative = jest.requireActual<typeof import('react-native')>('react-native');

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    back: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('expo-image', () => ({
  Image: (props: Record<string, unknown>) => <mockReactNative.Image {...props} />,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <mockReactNative.View {...props}>{children}</mockReactNative.View>
  ),
}));

jest.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: () => null,
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/hooks/use-safe-camera-permissions', () => ({
  useSafeCameraPermissions: () => [null, jest.fn()],
}));

const mockSetTradition = jest.fn();

jest.mock('@/hooks/use-tradition', () => ({
  useTradition: () => ({
    tradition: 'christianity',
    setTradition: mockSetTradition,
  }),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockSetTradition.mockClear();
  });

  it('updates the preview theme as the selected tradition changes', () => {
    render(<OnboardingScreen />);

    expect(screen.getByTestId('tradition-preview-background').props.source).toBe(
      getTraditionUiTheme('christianity').backgroundImage,
    );
    expect(screen.getByTestId('tradition-preview-cta').props.colors).toEqual(
      getTraditionUiTheme('christianity').ctaGradient,
    );

    fireEvent.press(screen.getByTestId('tradition-option-islam'));

    expect(screen.getByTestId('tradition-preview-background').props.source).toBe(
      getTraditionUiTheme('islam').backgroundImage,
    );
    expect(screen.getByTestId('tradition-preview-cta').props.colors).toEqual(
      getTraditionUiTheme('islam').ctaGradient,
    );
    expect(mockSetTradition).not.toHaveBeenCalled();
  });
});
