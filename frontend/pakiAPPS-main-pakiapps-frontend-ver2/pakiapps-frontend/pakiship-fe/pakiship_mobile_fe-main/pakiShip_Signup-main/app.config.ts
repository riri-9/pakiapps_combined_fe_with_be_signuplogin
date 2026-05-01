import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "PakiApps",
  slug: "PakiShipMobile",
  version: "1.0.0",
  scheme: "pakiship",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png"
    },
    package: "com.anonymous.PakiShipMobile"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3000/api/v1',
    supabaseUrl:
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      'https://rregfrhtlmfktliijzpd.supabase.co',
    supabasePublishableKey:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      'sb_publishable__1PnaWg4F91cxR3KFqQITA_TDMmdtLV',
  },
  plugins: []
});
