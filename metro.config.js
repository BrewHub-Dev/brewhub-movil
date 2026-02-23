const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('bin');
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, 'src'),
  '@assets': path.resolve(__dirname, 'assets'),
  'react-native-reanimated': require.resolve('react-native-reanimated'),
};

module.exports = withNativeWind(config, { input: './src/global.css', configPath: './tailwind.config.js', });
