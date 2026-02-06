import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'accent';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.surface,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          elevation: 3,
          borderWidth: Platform.OS === 'android' ? 0 : 1,
          borderColor: colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        };
      case 'accent':
        return {
          backgroundColor: colorScheme === 'light' ? '#E0E7FF' : theme.surface,
          borderColor: colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : theme.primary,
          borderWidth: colorScheme === 'light' ? 0 : 1,
        };
      default:
        return {
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        };
    }
  };

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24, // Generously rounded corners as per DESIGN.md
    padding: 24,
    overflow: 'hidden',
  },
});
