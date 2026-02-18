import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const pluginsToAdd = ['expo-audio', 'expo-asset', '@react-native-community/datetimepicker'];
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
  };
};
