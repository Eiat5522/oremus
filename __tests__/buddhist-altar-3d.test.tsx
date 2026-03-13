import { act, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { Altar3DPlaceholder } from '@/components/buddhist-prayer';

describe('buddhist altar 3D placeholder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as never);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows a safe loading state before settling on the altar fallback scene in tests', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Altar3DPlaceholder showHalo showIncenseSmoke />,
    );

    expect(getByText('Preparing 3D altar…')).toBeTruthy();
    expect(getByTestId('altar-fallback')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(queryByTestId('altar-loading')).toBeNull();
  });

  it('respects halo and incense smoke visibility props in fallback mode', async () => {
    const { queryByTestId } = render(
      <Altar3DPlaceholder showHalo={false} showIncenseSmoke={false} animated={false} />,
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(queryByTestId('altar-halo-overlay')).toBeNull();
    expect(queryByTestId('altar-smoke-overlay')).toBeNull();
  });
});
