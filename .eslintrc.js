module.exports = {
  root: true,
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/'],
  overrides: [
    {
      // @react-three/fiber uses custom JSX intrinsic elements (Three.js objects).
      // Disable react/no-unknown-property for 3D scene files where R3F JSX is used.
      files: ['**/christian-scene-3d-scene.tsx'],
      rules: {
        'react/no-unknown-property': 'off',
      },
    },
  ],
};
