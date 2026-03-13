import { render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { BuddhistAltar3D } from '@/components/buddhist-prayer';

describe('buddhist altar 3D placeholder', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the altar scene with accessible overlays when motion is allowed', () => {
    const { getByTestId, getAllByTestId, getByA11yHint } = render(
      <BuddhistAltar3D showHalo showIncenseSmoke />,
    );

    expect(getByTestId('altar-fallback')).toBeTruthy();
    expect(getByTestId('altar-halo-overlay')).toBeTruthy();
    expect(getAllByTestId('altar-smoke-overlay')).toHaveLength(2);
    expect(getAllByTestId('altar-particle')).toHaveLength(4);
    expect(getByA11yHint('Animated altar preview with halo and incense.')).toBeTruthy();
  });

  it('respects reduced motion by removing animated particles and using a static accessibility hint', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    const { getByA11yHint, queryAllByTestId } = render(
      <BuddhistAltar3D showHalo showIncenseSmoke />,
    );

    await waitFor(() => {
      expect(queryAllByTestId('altar-particle')).toHaveLength(0);
    });
    expect(getByA11yHint('Static altar preview shown with reduced motion enabled.')).toBeTruthy();
  });

  it('respects halo and incense smoke visibility props in static mode', () => {
    const { queryByTestId } = render(
      <BuddhistAltar3D showHalo={false} showIncenseSmoke={false} animated={false} />,
    );

    expect(queryByTestId('altar-halo-overlay')).toBeNull();
    expect(queryByTestId('altar-smoke-overlay')).toBeNull();
  });
});
