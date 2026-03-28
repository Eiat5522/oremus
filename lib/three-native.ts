import { Platform } from 'react-native';
import * as THREE from 'three';

type NativeGlContext = WebGLRenderingContext & {
  __oremusPatchedPixelStorei?: boolean;
  __oremusPatchedGetShaderPrecisionFormat?: boolean;
  getShaderPrecisionFormat?: (
    shaderType: number,
    precisionType: number,
  ) => { precision: number; rangeMin: number; rangeMax: number } | null | undefined;
  pixelStorei?: (pname: number, param: number | boolean) => void;
};

type NativeCanvasRendererProps = {
  alpha?: boolean;
  antialias?: boolean;
  canvas: {
    getContext: (
      contextId: string,
      contextAttributes?: { antialias?: boolean },
    ) => NativeGlContext | null;
  };
  powerPreference?: 'default' | 'high-performance' | 'low-power';
};

const DEFAULT_SHADER_PRECISION = Object.freeze({
  precision: 23,
  rangeMax: 127,
  rangeMin: 127,
});

let nativeThreeEnvironmentReady = false;

export function ensureNativeThreeEnvironment() {
  if (nativeThreeEnvironmentReady || Platform.OS === 'web') {
    return;
  }

  const globalWithNavigator = globalThis as typeof globalThis & {
    navigator?: { userAgent?: string };
  };
  const fallbackUserAgent = `ReactNative/${Platform.OS}`;

  if (!globalWithNavigator.navigator) {
    globalWithNavigator.navigator = { userAgent: fallbackUserAgent };
  } else if (
    typeof globalWithNavigator.navigator.userAgent !== 'string' ||
    globalWithNavigator.navigator.userAgent.length === 0
  ) {
    Object.defineProperty(globalWithNavigator.navigator, 'userAgent', {
      configurable: true,
      value: fallbackUserAgent,
      writable: true,
    });
  }

  nativeThreeEnvironmentReady = true;
}

function patchShaderPrecision(gl: NativeGlContext | null) {
  if (!gl || typeof gl.getShaderPrecisionFormat !== 'function') {
    return gl;
  }

  if (gl.__oremusPatchedGetShaderPrecisionFormat) {
    return gl;
  }

  const getShaderPrecisionFormat = gl.getShaderPrecisionFormat.bind(gl);

  gl.getShaderPrecisionFormat = (shaderType, precisionType) =>
    getShaderPrecisionFormat(shaderType, precisionType) ?? DEFAULT_SHADER_PRECISION;

  Object.defineProperty(gl, '__oremusPatchedGetShaderPrecisionFormat', {
    configurable: true,
    value: true,
  });

  return gl;
}

const NATIVE_SUPPORTED_PIXEL_STORE_PARAMETERS = new Set([
  0x0cf5, // UNPACK_ALIGNMENT
  0x9240, // UNPACK_FLIP_Y_WEBGL
]);

export function patchPixelStorei(gl: NativeGlContext | null) {
  if (!gl || typeof gl.pixelStorei !== 'function') {
    return gl;
  }

  if (gl.__oremusPatchedPixelStorei) {
    return gl;
  }

  const pixelStorei = gl.pixelStorei.bind(gl);

  gl.pixelStorei = (pname, param) => {
    if (!NATIVE_SUPPORTED_PIXEL_STORE_PARAMETERS.has(pname)) {
      return;
    }

    pixelStorei(pname, param);
  };

  Object.defineProperty(gl, '__oremusPatchedPixelStorei', {
    configurable: true,
    value: true,
  });

  return gl;
}

export function createNativeCanvasRenderer(defaultProps: NativeCanvasRendererProps) {
  ensureNativeThreeEnvironment();

  const context = patchPixelStorei(
    patchShaderPrecision(
      defaultProps.canvas.getContext('webgl', { antialias: defaultProps.antialias ?? true }),
    ),
  );

  const renderer = new THREE.WebGLRenderer({
    ...defaultProps,
    context: context ?? undefined,
  });

  // expo-gl's WebGL context returns null (not '') from getShaderInfoLog /
  // getProgramInfoLog on Android, which causes Three.js WebGLProgram to throw
  // "Cannot read property 'trim' of undefined" during shader compilation.
  // Disabling checkShaderErrors skips that code path entirely on native.
  if (Platform.OS !== 'web') {
    renderer.debug.checkShaderErrors = false;
  }

  return renderer;
}
