import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDevelopment = String(process.env.EXPO_IS_STAGING).toLowerCase() === 'true';
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  const pluginsToAdd = [
    'expo-audio',
    'expo-asset',
    'expo-camera',
    '@react-native-community/datetimepicker',
    './plugins/with-focus-gate-android',
  ];
  const existingPluginNames = new Set(
    (config.plugins ?? []).map((p) => (Array.isArray(p) ? p[0] : p)),
  );
  const plugins = [
    ...(config.plugins ?? []),
    ...pluginsToAdd.filter((p) => !existingPluginNames.has(p)),
  ];

  return {
    ...config,
    slug: 'oremus',
    name: 'oremus',
    version: '1.0.0',
    plugins,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        ...(googleMapsApiKey ? { googleMapsApiKey } : {}),
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          ...config.android?.config?.googleMaps,
          ...(googleMapsApiKey ? { apiKey: googleMapsApiKey } : {}),
        },
      },
    },
    extra: {
      ...(config.extra ?? {}),
      hasGoogleMapsApiKey: Boolean(googleMapsApiKey),
    },
    updates: {
      ...(config.updates ?? {}),
      ...(isDevelopment ? { checkAutomatically: 'NEVER' as const } : {}),
    },
  };
};
