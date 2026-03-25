import { getDefaultConfig } from 'expo/metro-config.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import exclusionListModule from './node_modules/metro-config/src/defaults/exclusionList.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const exclusionList = exclusionListModule.default;
const threeModulePath = join(__dirname, 'node_modules/three/build/three.module.js');

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
// Keep bare `three` imports on one entrypoint so R3F native and app code share one runtime instance.
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === 'three') {
		return context.resolveRequest(context, threeModulePath, platform);
	}

	return context.resolveRequest(context, moduleName, platform);
};

export default config;
