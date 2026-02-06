import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'oremus',
  name: 'oremus',
  version: '1.0.0',
});
