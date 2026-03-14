import React, { memo } from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated, View } from 'react-native';

import { Altar3DPlaceholder, BuddhistAltar3D } from '@/components/buddhist-prayer';
import { __setAltarSceneLoaderForTests } from '@/components/buddhist-prayer/buddhist-altar-3d';

let mockShouldThrowScene = false;

describe('buddhist altar 3D placeholder', () => {
  beforeEach(() => {
    mockShouldThrowScene = false;
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as never);
    __setAltarSceneLoaderForTests(async () => ({
      AltarScene3D: memo(function MockAltarScene3D({
        animated,
        glowIntensity,
        onReady,
        rotation,
        scale,
        showHalo,
        showIncenseSmoke,
      }: {
        animated: boolean;
        glowIntensity: number;
        onReady?: () => void;
        rotation: number;
        scale: number;
        showHalo: boolean;
        showIncenseSmoke: boolean;
      }) {
        React.useEffect(() => {
          onReady?.();
        }, [onReady]);

        if (mockShouldThrowScene) {
          throw new Error('3D scene failed to render');
        }

        return (
          <View
            testID="altar-scene"
            nativeID={JSON.stringify({
              animated,
              glowIntensity,
              rotation,
              scale,
              showHalo,
              showIncenseSmoke,
            })}
          />
        );
      }),
    }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    __setAltarSceneLoaderForTests(null);
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

  it('does not start halo, smoke, or particle loops when reduced motion is enabled', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const loopSpy = jest.spyOn(Animated, 'loop');

    render(<BuddhistAltar3D showHalo />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(loopSpy).not.toHaveBeenCalled();
  });

  it('loads the live altar scene and forwards the full BuddhistAltar3D contract', async () => {
    const { getByTestId, queryByTestId } = render(
      <BuddhistAltar3D
        animated={false}
        glowIntensity={1.8}
        rotation={24}
        scale={1.15}
        showHalo={false}
        showIncenseSmoke={false}
      />,
    );

    expect(getByTestId('altar-fallback')).toBeTruthy();

    await waitFor(() => expect(getByTestId('altar-scene')).toBeTruthy());

    const scene = getByTestId('altar-scene');

    expect(JSON.parse(scene.props.nativeID)).toEqual({
      animated: false,
      glowIntensity: 1.8,
      rotation: 24,
      scale: 1.15,
      showHalo: false,
      showIncenseSmoke: false,
    });
    expect(queryByTestId('altar-loading')).toBeNull();
  });

  it('keeps the safe fallback visible if the live altar scene fails to render', async () => {
    mockShouldThrowScene = true;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByTestId, queryByTestId } = render(<BuddhistAltar3D animated={false} />);

    await waitFor(() => expect(getByTestId('altar-fallback')).toBeTruthy());

    expect(getByTestId('altar-fallback')).toBeTruthy();
    expect(queryByTestId('altar-scene')).toBeNull();

    consoleErrorSpy.mockRestore();
  });
});
