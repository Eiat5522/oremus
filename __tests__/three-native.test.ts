import { patchPixelStorei } from '@/lib/three-native';

describe('patchPixelStorei', () => {
  it('passes through Expo-supported pixelStorei parameters', () => {
    const pixelStorei = jest.fn();
    const gl = {
      pixelStorei,
    } as unknown as WebGLRenderingContext;

    patchPixelStorei(gl);
    gl.pixelStorei?.(0x0cf5, 4);
    gl.pixelStorei?.(0x9240, true);

    expect(pixelStorei).toHaveBeenNthCalledWith(1, 0x0cf5, 4);
    expect(pixelStorei).toHaveBeenNthCalledWith(2, 0x9240, true);
  });

  it('silently ignores Expo-unsupported pixelStorei parameters', () => {
    const pixelStorei = jest.fn();
    const gl = {
      pixelStorei,
    } as unknown as WebGLRenderingContext;

    patchPixelStorei(gl);
    gl.pixelStorei?.(0x9241, false);
    gl.pixelStorei?.(0x9243, 0);

    expect(pixelStorei).not.toHaveBeenCalled();
  });
});
