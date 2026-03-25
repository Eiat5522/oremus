import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const patches = [
  {
    file: 'node_modules/expo-gl/src/GLView.tsx',
    marker: 'ERR_GL_CONTEXT_NOT_READY',
    replacements: [
      {
        from: `  _onSurfaceCreate = ({ nativeEvent: { exglCtxId } }: SurfaceCreateEvent): void => {
    const gl = getGl(exglCtxId);

    this.exglCtxId = exglCtxId;

    if (this.props.onContextCreate) {
      this.props.onContextCreate(gl);
    }
  };`,
        to: `  _onSurfaceCreate = async ({
    nativeEvent: { exglCtxId },
  }: SurfaceCreateEvent): Promise<void> => {
    try {
      const gl = await getGlAsync(exglCtxId);

      this.exglCtxId = exglCtxId;

      if (this.props.onContextCreate) {
        this.props.onContextCreate(gl);
      }
    } catch (error) {
      console.error(\`expo-gl: failed to resolve GL context \${exglCtxId}\`, error);
    }
  };`,
      },
      {
        from: `const getGl = (exglCtxId: number): ExpoWebGLRenderingContext => {
  if (!global.__EXGLContexts) {
    throw new CodedError(
      'ERR_GL_NOT_AVAILABLE',
      'GL is currently not available. (Have you enabled remote debugging? GL is not available while debugging remotely.)'
    );
  }
  const gl = global.__EXGLContexts[String(exglCtxId)];

  configureLogging(gl);

  return gl;
};`,
        to: `const getGl = (exglCtxId: number): ExpoWebGLRenderingContext => {
  if (!global.__EXGLContexts) {
    throw new CodedError(
      'ERR_GL_NOT_AVAILABLE',
      'GL is currently not available. (Have you enabled remote debugging? GL is not available while debugging remotely.)'
    );
  }
  const gl = global.__EXGLContexts[String(exglCtxId)];

  configureLogging(gl);

  return gl;
};

const getGlAsync = async (
  exglCtxId: number,
  maxAttempts = 300,
  retryDelayMs = 16
): Promise<ExpoWebGLRenderingContext> => {
  if (!global.__EXGLContexts) {
    throw new CodedError(
      'ERR_GL_NOT_AVAILABLE',
      'GL is currently not available. (Have you enabled remote debugging? GL is not available while debugging remotely.)'
    );
  }
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const gl = global.__EXGLContexts?.[String(exglCtxId)];
    if (gl) {
      configureLogging(gl);
      return gl;
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }

  throw new CodedError(
    'ERR_GL_CONTEXT_NOT_READY',
    \`EXGL context \${String(exglCtxId)} was created, but its JS binding was not ready before timeout.\`
  );
};`,
      },
    ],
  },
  {
    file: 'node_modules/expo-gl/build/GLView.js',
    marker: 'ERR_GL_CONTEXT_NOT_READY',
    replacements: [
      {
        from: `    _onSurfaceCreate = ({ nativeEvent: { exglCtxId } }) => {
        const gl = getGl(exglCtxId);
        this.exglCtxId = exglCtxId;
        if (this.props.onContextCreate) {
            this.props.onContextCreate(gl);
        }
    };`,
        to: `    _onSurfaceCreate = async ({ nativeEvent: { exglCtxId } }) => {
        try {
            const gl = await getGlAsync(exglCtxId);
            this.exglCtxId = exglCtxId;
            if (this.props.onContextCreate) {
                this.props.onContextCreate(gl);
            }
        }
        catch (error) {
            console.error(\`expo-gl: failed to resolve GL context \${exglCtxId}\`, error);
        }
    };`,
      },
      {
        from: `const getGl = (exglCtxId) => {
    if (!global.__EXGLContexts) {
        throw new CodedError('ERR_GL_NOT_AVAILABLE', 'GL is currently not available. (Have you enabled remote debugging? GL is not available while debugging remotely.)');
    }
    const gl = global.__EXGLContexts[String(exglCtxId)];
    configureLogging(gl);
    return gl;
};`,
        to: `const getGl = (exglCtxId) => {
    if (!global.__EXGLContexts) {
        throw new CodedError('ERR_GL_NOT_AVAILABLE', 'GL is currently not available. (Have you enabled remote debugging? GL is not available while debugging remotely.)');
    }
    const gl = global.__EXGLContexts[String(exglCtxId)];
    configureLogging(gl);
    return gl;
};
const getGlAsync = async (exglCtxId, maxAttempts = 300, retryDelayMs = 16) => {
    if (!global.__EXGLContexts) {
        throw new CodedError('ERR_GL_NOT_AVAILABLE', 'GL is currently not available. (Have you enabled remote debugging? GL is not available while debugging remotely.)');
    }
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const gl = global.__EXGLContexts?.[String(exglCtxId)];
        if (gl) {
            configureLogging(gl);
            return gl;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
    throw new CodedError('ERR_GL_CONTEXT_NOT_READY', \`EXGL context \${String(exglCtxId)} was created, but its JS binding was not ready before timeout.\`);
};`,
      },
    ],
  },
  {
    file: 'node_modules/three/src/renderers/shaders/ShaderChunk/lights_physical_fragment.glsl.js',
    marker: 'material.dispersion = 0.0;',
    replacements: [
      {
        from: `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
`,
        to: `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.dispersion = 0.0;
`,
      },
    ],
  },
  {
    file: 'node_modules/three/build/three.module.js',
    marker: 'material.dispersion = 0.0;',
    replacements: [
      {
        from: `var lights_physical_fragment = "PhysicalMaterial material;\\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\\nvec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );\\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\\nmaterial.roughness = min( material.roughness, 1.0 );\\n#ifdef IOR\\n\\tmaterial.ior = ior;\\n\\t#ifdef USE_SPECULAR\\n\\t\\tfloat specularIntensityFactor = specularIntensity;\\n\\t\\tvec3 specularColorFactor = specularColor;\\n\\t\\t#ifdef USE_SPECULAR_COLORMAP\\n\\t\\t\\tspecularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\\n\\t\\t#endif\\n\\t\\t#ifdef USE_SPECULAR_INTENSITYMAP\\n\\t\\t\\tspecularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\\n\\t\\t#endif\\n\\t\\tmaterial.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\\n\\t#else\\n\\t\\tfloat specularIntensityFactor = 1.0;\\n\\t\\tvec3 specularColorFactor = vec3( 1.0 );\\n\\t\\tmaterial.specularF90 = 1.0;\\n\\t#endif\\n\\tmaterial.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );\\n#else\\n\\tmaterial.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );\\n\\tmaterial.specularF90 = 1.0;\\n#endif\\n#ifdef USE_CLEARCOAT\\n\\tmaterial.clearcoat = clearcoat;\\n\\tmaterial.clearcoatRoughness = clearcoatRoughness;\\n\\tmaterial.clearcoatF0 = vec3( 0.04 );\\n\\tmaterial.clearcoatF90 = 1.0;\\n\\t#ifdef USE_CLEARCOATMAP\\n\\t\\tmaterial.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\\n\\t#endif\\n\\t#ifdef USE_CLEARCOAT_ROUGHNESSMAP\\n\\t\\tmaterial.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\\n\\t#endif\\n\\tmaterial.clearcoat = saturate( material.clearcoat );\\tmaterial.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\\n\\tmaterial.clearcoatRoughness += geometryRoughness;\\n\\tmaterial.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\\n#endif\\n#ifdef USE_DISPERSION\\n\\tmaterial.dispersion = dispersion;\\n#endif\\n#ifdef USE_IRIDESCENCE\\n\\tmaterial.iridescence = iridescence;\\n\\tmaterial.iridescenceIOR = iridescenceIOR;\\n\\t#ifdef USE_IRIDESCENCEMAP\\n\\t\\tmaterial.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\\n\\t#endif\\n\\t#ifdef USE_IRIDESCENCE_THICKNESSMAP\\n\\t\\tmaterial.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\\n\\t#else\\n\\t\\tmaterial.iridescenceThickness = iridescenceThicknessMaximum;\\n\\t#endif\\n#endif\\n#ifdef USE_SHEEN\\n\\tmaterial.sheenColor = sheenColor;\\n\\t#ifdef USE_SHEEN_COLORMAP\\n\\t\\tmaterial.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\\n\\t#endif\\n\\tmaterial.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );\\n\\t#ifdef USE_SHEEN_ROUGHNESSMAP\\n\\t\\tmaterial.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\\n\\t#endif\\n#endif\\n#ifdef USE_ANISOTROPY\\n\\t#ifdef USE_ANISOTROPYMAP\\n\\t\\tmat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );\\n\\t\\tvec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;\\n\\t\\tvec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;\\n\\t#else\\n\\t\\tvec2 anisotropyV = anisotropyVector;\\n\\t#endif\\n\\tmaterial.anisotropy = length( anisotropyV );\\n\\tif( material.anisotropy == 0.0 ) {\\n\\t\\tanisotropyV = vec2( 1.0, 0.0 );\\n\\t} else {\\n\\t\\tanisotropyV /= material.anisotropy;\\n\\t\\tmaterial.anisotropy = saturate( material.anisotropy );\\n\\t}\\n\\tmaterial.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );\\n\\tmaterial.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;\\n\\tmaterial.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;\\n#endif";`,
        to: `var lights_physical_fragment = "PhysicalMaterial material;\\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\\nmaterial.dispersion = 0.0;\\nvec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );\\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\\nmaterial.roughness = min( material.roughness, 1.0 );\\n#ifdef IOR\\n\\tmaterial.ior = ior;\\n\\t#ifdef USE_SPECULAR\\n\\t\\tfloat specularIntensityFactor = specularIntensity;\\n\\t\\tvec3 specularColorFactor = specularColor;\\n\\t\\t#ifdef USE_SPECULAR_COLORMAP\\n\\t\\t\\tspecularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\\n\\t\\t#endif\\n\\t\\t#ifdef USE_SPECULAR_INTENSITYMAP\\n\\t\\t\\tspecularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\\n\\t\\t#endif\\n\\t\\tmaterial.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\\n\\t#else\\n\\t\\tfloat specularIntensityFactor = 1.0;\\n\\t\\tvec3 specularColorFactor = vec3( 1.0 );\\n\\t\\tmaterial.specularF90 = 1.0;\\n\\t#endif\\n\\tmaterial.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );\\n#else\\n\\tmaterial.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );\\n\\tmaterial.specularF90 = 1.0;\\n#endif\\n#ifdef USE_CLEARCOAT\\n\\tmaterial.clearcoat = clearcoat;\\n\\tmaterial.clearcoatRoughness = clearcoatRoughness;\\n\\tmaterial.clearcoatF0 = vec3( 0.04 );\\n\\tmaterial.clearcoatF90 = 1.0;\\n\\t#ifdef USE_CLEARCOATMAP\\n\\t\\tmaterial.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\\n\\t#endif\\n\\t#ifdef USE_CLEARCOAT_ROUGHNESSMAP\\n\\t\\tmaterial.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\\n\\t#endif\\n\\tmaterial.clearcoat = saturate( material.clearcoat );\\tmaterial.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\\n\\tmaterial.clearcoatRoughness += geometryRoughness;\\n\\tmaterial.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\\n#endif\\n#ifdef USE_DISPERSION\\n\\tmaterial.dispersion = dispersion;\\n#endif\\n#ifdef USE_IRIDESCENCE\\n\\tmaterial.iridescence = iridescence;\\n\\tmaterial.iridescenceIOR = iridescenceIOR;\\n\\t#ifdef USE_IRIDESCENCEMAP\\n\\t\\tmaterial.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\\n\\t#endif\\n\\t#ifdef USE_IRIDESCENCE_THICKNESSMAP\\n\\t\\tmaterial.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\\n\\t#else\\n\\t\\tmaterial.iridescenceThickness = iridescenceThicknessMaximum;\\n\\t#endif\\n#endif\\n#ifdef USE_SHEEN\\n\\tmaterial.sheenColor = sheenColor;\\n\\t#ifdef USE_SHEEN_COLORMAP\\n\\t\\tmaterial.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\\n\\t#endif\\n\\tmaterial.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );\\n\\t#ifdef USE_SHEEN_ROUGHNESSMAP\\n\\t\\tmaterial.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\\n\\t#endif\\n#endif\\n#ifdef USE_ANISOTROPY\\n\\t#ifdef USE_ANISOTROPYMAP\\n\\t\\tmat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );\\n\\t\\tvec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;\\n\\t\\tvec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;\\n\\t#else\\n\\t\\tvec2 anisotropyV = anisotropyVector;\\n\\t#endif\\n\\tmaterial.anisotropy = length( anisotropyV );\\n\\tif( material.anisotropy == 0.0 ) {\\n\\t\\tanisotropyV = vec2( 1.0, 0.0 );\\n\\t} else {\\n\\t\\tanisotropyV /= material.anisotropy;\\n\\t\\tmaterial.anisotropy = saturate( material.anisotropy );\\n\\t}\\n\\tmaterial.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );\\n\\tmaterial.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;\\n\\tmaterial.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;\\n#endif";`,
      },
    ],
  },
];

function applyPatch({ file, marker, replacements }) {
  const filePath = join(root, file);
  let contents = readFileSync(filePath, 'utf8');

  if (contents.includes(marker)) {
    console.log(`expo-gl patch already applied: ${file}`);
    return;
  }

  for (const { from, to } of replacements) {
    if (!contents.includes(from)) {
      throw new Error(`Patch target not found in ${file}`);
    }
    contents = contents.replace(from, to);
  }

  writeFileSync(filePath, contents);
  console.log(`Applied expo-gl patch: ${file}`);
}

for (const patch of patches) {
  applyPatch(patch);
}
