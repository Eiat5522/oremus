import { MockChristianArEngine } from '@/features/christian-prayer/ar/MockChristianArEngine';

describe('MockChristianArEngine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes, scans, and detects a surface', async () => {
    const engine = new MockChristianArEngine();

    await expect(engine.initialize()).resolves.toEqual({
      supported: true,
      errorCode: null,
    });

    await engine.startSession();
    expect(engine.getPlacementState().status).toBe('scanning');

    jest.advanceTimersByTime(700);
    expect(engine.getPlacementState().status).toBe('trackingWeak');

    jest.advanceTimersByTime(1000);
    expect(engine.getPlacementState().status).toBe('surfaceDetected');
    expect(engine.getPlacementState().canPlace).toBe(true);
  });

  it('places, updates, and resets the prayer corner', async () => {
    const engine = new MockChristianArEngine();

    await engine.initialize();
    await engine.startSession();
    jest.advanceTimersByTime(2000);

    await engine.placePrayerCorner({ scale: 1.18, rotation: 28 });
    let placement = engine.getPlacementState();
    expect(placement.isPlaced).toBe(true);
    expect(placement.transform.scale).toBe(1.18);
    expect(placement.transform.rotation).toBe(28);

    await engine.updatePrayerCorner({ scale: 1.34, rotation: 52 });
    placement = engine.getPlacementState();
    expect(placement.transform.scale).toBe(1.34);
    expect(placement.transform.rotation).toBe(52);

    await engine.resetPlacement();
    placement = engine.getPlacementState();
    expect(placement.status).toBe('placementLost');
    expect(placement.errorCode).toBe('placementLost');
    expect(placement.retryCount).toBe(1);
  });
});
