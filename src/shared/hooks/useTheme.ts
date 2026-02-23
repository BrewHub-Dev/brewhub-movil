import { useColorScheme } from 'react-native';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    // Para usar con className de forma dinámica
    bg: {
      primary: isDark ? 'bg-zinc-950' : 'bg-white',
      secondary: isDark ? 'bg-zinc-900' : 'bg-gray-50',
      card: isDark ? 'bg-zinc-900' : 'bg-white',
      cardHover: isDark ? 'bg-zinc-800' : 'bg-gray-50',
    },
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-zinc-400' : 'text-gray-600',
      tertiary: isDark ? 'text-zinc-500' : 'text-gray-500',
    },
    border: {
      primary: isDark ? 'border-zinc-800' : 'border-gray-200',
      secondary: isDark ? 'border-zinc-700' : 'border-gray-300',
    },
    // Colores para usar directamente
    colors: {
      background: isDark ? '#09090b' : '#ffffff',
      backgroundSecondary: isDark ? '#18181b' : '#f9fafb',
      card: isDark ? '#27272a' : '#ffffff',
      text: isDark ? '#fafafa' : '#18181b',
      textSecondary: isDark ? '#a1a1aa' : '#6b7280',
      textTertiary: isDark ? '#71717a' : '#9ca3af',
      primary: '#f59e0b',
      border: isDark ? '#3f3f46' : '#e5e7eb',
      error: isDark ? '#ef4444' : '#dc2626',
      success: isDark ? '#22c55e' : '#16a34a',
      overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    },
  };
}
