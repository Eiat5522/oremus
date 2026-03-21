import { getDefaultConfig } from 'expo/metro-config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import exclusionListModule from './node_modules/metro-config/src/defaults/exclusionList.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const exclusionList = exclusionListModule.default;

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('glb')) {
	config.resolver.assetExts.push('glb');
}
if (!config.resolver.assetExts.includes('gltf')) {
	config.resolver.assetExts.push('gltf');
}
config.resolver.blockList = exclusionList([
	/\/assets\/models\/tmp\/.*/,
	/\/node_modules\/\.[^/]+\/.*/,
]);

export default config;
