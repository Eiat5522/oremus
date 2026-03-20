import React from 'react';
import { render } from '@testing-library/react-native';
import { Scene3DPlaceholder } from '@/components/christian-prayer/scene-3d-placeholder';

describe('Scene3DPlaceholder', () => {
  it('renders with default label', () => {
    const { getByText } = render(<Scene3DPlaceholder />);
    expect(getByText('Prayer Scene')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { getByText } = render(<Scene3DPlaceholder label="Custom Scene" />);
    expect(getByText('Custom Scene')).toBeTruthy();
  });
});
