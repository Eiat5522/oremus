describe('focus gate native bridge compatibility', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('returns false when the native module does not expose triggerBlockNow', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.doMock('react-native', () => ({
      NativeModules: {
        FocusGateModule: {
          syncSettings: jest.fn(),
          getServiceStatus: jest.fn(),
          openAccessibilitySettings: jest.fn(),
          openUsageAccessSettings: jest.fn(),
        },
      },
      Platform: { OS: 'android' },
    }));

    let triggerFocusGateBlockNow: typeof import('@/lib/focus-gate-native').triggerFocusGateBlockNow;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ triggerFocusGateBlockNow } = require('@/lib/focus-gate-native'));
    });

    await expect(triggerFocusGateBlockNow('com.instagram.android', 'Instagram')).resolves.toBe(
      false,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[focus-gate] Native module is missing triggerBlockNow. Rebuild the Android dev client.',
    );
  });
});
