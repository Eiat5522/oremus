import { getDefaultConfig } from 'expo/metro-config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'gltf', 'bin'];

export default config;
