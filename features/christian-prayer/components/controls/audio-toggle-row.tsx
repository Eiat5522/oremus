import React from 'react';

import { ToggleRow } from '@/features/christian-prayer/components/controls/toggle-row';

interface AudioToggleRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: React.ReactNode;
}

export function AudioToggleRow(props: AudioToggleRowProps) {
  return <ToggleRow {...props} />;
}
