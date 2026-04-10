import type { ExpoConfig, ConfigContext } from 'expo/config';

interface BrandConfig {
  appName: string;
  shopName?: string;
  slug: string;
  scheme: string;
  bundleIdentifier: string;
  package: string;
  tenantId: string;
}

const brand = process.env.BRAND || 'brewhub';
const brandConfigs: Record<string, BrandConfig> = {
  brewhub: {
    appName: 'BrewHub',
    shopName: 'Café del Centro',
    slug: 'brewhub-movil',
    scheme: 'brewhub',
    bundleIdentifier: 'com.brewhub.app',
    package: 'com.brewhub.app',
    tenantId: '660000000000000000000001',
  },
  'cafe-los-alpes': {
    appName: 'Café Los Alpes',
    slug: 'cafe-los-alpes',
    scheme: 'cafelosalpes',
    bundleIdentifier: 'com.brewhub.cafelosalpes',
    package: 'com.brewhub.cafelosalpes',
    tenantId: 'REPLACE_WITH_ACTUAL_TENANT_ID',
  },
};

const brandConfig = brandConfigs[brand];

if (!brandConfig) {
  throw new Error(`Config for brand "${brand}" not found`);
}

const assetPath = `./brands/${brand}/assets`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: brandConfig.appName,
  slug: brandConfig.slug,
  version: '1.0.0',
  orientation: 'portrait',
  icon: `${assetPath}/icon.png`,
  scheme: brandConfig.scheme,
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: `${assetPath}/splash-icon.png`,
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: brandConfig.bundleIdentifier,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: brandConfig.package,
    adaptiveIcon: {
      foregroundImage: `${assetPath}/adaptive-icon.png`,
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: `${assetPath}/favicon.png`,
    bundler: 'metro',
    meta: {
      name: brandConfig.appName,
      description: 'Order your favorite coffee drinks',
      themeColor: '#f59e0b',
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: brandConfig.appName,
      },
    },
  },
  plugins: [
    'expo-secure-store',
  ],
  extra: {
    brand: {
      appName: brandConfig.appName,
      shopName: brandConfig.shopName,
      scheme: brandConfig.scheme,
      tenantId: brandConfig.tenantId,
    },
    eas: {
      projectId: 'f70f24f8-346a-475a-ba64-03689b26bb6f',
    },
  },
  owner: 'whoistymo',
});
