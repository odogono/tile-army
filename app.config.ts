import { ConfigContext, ExpoConfig } from '@expo/config';
import * as dotenv from 'dotenv';

const IS_DEV = process.env.APP_VARIANT === 'development';

dotenv.config();

if (IS_DEV) {
  require('./src/ReactotronConfig');
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? 'TileArmy (Dev)' : 'TileArmy',
  slug: 'tile-army',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'tilearmy',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: IS_DEV ? 'net.odgn.tilearmy.dev' : 'net.odgn.tilearmy',
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: IS_DEV ? 'net.odgn.tilearmy.dev' : 'net.odgn.tilearmy',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'd55019e7-13b7-494e-a939-188fcf80dfac',
    },
  },
});
