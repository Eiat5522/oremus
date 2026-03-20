import { renderHook, act } from '@testing-library/react-native';
import { useChristianSceneExperience, DEFAULT_CHRISTIAN_SCENE_MODE } from '@/hooks/use-christian-scene-experience';

jest.useFakeTimers();

describe('useChristianSceneExperience', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('starts with default mode and not ready', () => {
    const { result } = renderHook(() => useChristianSceneExperience());
    expect(result.current.mode).toBe(DEFAULT_CHRISTIAN_SCENE_MODE);
    expect(result.current.isSceneReady).toBe(false);
  });

  it('becomes ready after 1400ms in immersive3D mode', () => {
    const { result } = renderHook(() => useChristianSceneExperience());
    act(() => {
      result.current.startExperience('immersive3D');
    });
    expect(result.current.isSceneReady).toBe(false);
    act(() => {
      jest.advanceTimersByTime(1400);
    });
    expect(result.current.isSceneReady).toBe(true);
  });

  it('becomes ready on onCameraReady in nativeARReady mode', () => {
    const { result } = renderHook(() => useChristianSceneExperience());
    act(() => {
      result.current.startExperience('nativeARReady');
    });
    expect(result.current.isSceneReady).toBe(false);
    act(() => {
      result.current.onCameraReady();
    });
    expect(result.current.isSceneReady).toBe(true);
  });

  it('falls back to immersive3D on camera error', () => {
    const { result } = renderHook(() => useChristianSceneExperience());
    act(() => {
      result.current.startExperience('nativeARReady');
      result.current.onCameraError();
    });
    expect(result.current.mode).toBe('immersive3D');
    act(() => {
      jest.advanceTimersByTime(1400);
    });
    expect(result.current.isSceneReady).toBe(true);
  });

  it('resets experience correctly', () => {
    const { result } = renderHook(() => useChristianSceneExperience());
    act(() => {
      result.current.startExperience('immersive3D');
      jest.advanceTimersByTime(1400);
    });
    act(() => {
      result.current.resetExperience();
    });
    expect(result.current.isSceneReady).toBe(false);
    expect(result.current.mode).toBe(DEFAULT_CHRISTIAN_SCENE_MODE);
  });
});
