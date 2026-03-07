import React from 'react';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export function Glass({
  children,
  intensity = 60,
  isDark,
  style,
  className: cn,
}: Readonly<{
  children: React.ReactNode;
  intensity?: number;
  isDark: boolean;
  style?: any;
  className?: string;
}>) {
  if (Platform.OS === 'web') {
    return (
      <View
        className={cn}
        style={[
          {
            backgroundColor: isDark ? 'rgba(24,24,27,0.75)' : 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } as any,
          style,
        ]}
      >
        {children}
      </View>
    );
  }
  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      className={cn}
      style={style}
    >
      {children}
    </BlurView>
  );
}
