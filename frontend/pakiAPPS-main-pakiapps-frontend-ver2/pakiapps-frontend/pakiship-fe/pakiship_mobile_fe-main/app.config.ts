import { ExpoConfig, ConfigContext } from 'expo/config';

const defaultApiBaseUrl = 'http://127.0.0.1:3000/api/v1';
const defaultSupabaseUrl = 'https://rregfrhtlmfktliijzpd.supabase.co';
const defaultSupabaseAnonKey = 'sb_publishable__1PnaWg4F91cxR3KFqQITA_TDMmdtLV';
const defaultPasswordResetRedirectUrl = 'pakiship://reset-password';

function pickFirstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value?.trim());
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PakiApps',
  slug: 'PakiShipMobile',
  version: '1.0.0',
  scheme: 'pakiship',
  orientation: 'portrait',
  icon: './pakiShip_Signup-main/assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './pakiShip_Signup-main/assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './pakiShip_Signup-main/assets/android-icon-foreground.png',
      backgroundImage: './pakiShip_Signup-main/assets/android-icon-background.png',
      monochromeImage: './pakiShip_Signup-main/assets/android-icon-monochrome.png',
    },
    package: 'com.anonymous.PakiShipMobile',
  },
  web: {
    favicon: './pakiShip_Signup-main/assets/favicon.png',
  },
  extra: {
    apiBaseUrl:
      pickFirstDefined(
        process.env.EXPO_PUBLIC_API_BASE_URL,
        process.env.API_BASE_URL,
      ) ?? defaultApiBaseUrl,
    supabaseUrl:
      pickFirstDefined(
        process.env.EXPO_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_URL,
      ) ?? defaultSupabaseUrl,
    supabaseAnonKey:
      pickFirstDefined(
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        process.env.SUPABASE_ANON_KEY,
        process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ) ?? defaultSupabaseAnonKey,
    supabasePublishableKey:
      pickFirstDefined(
        process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        process.env.SUPABASE_ANON_KEY,
      ) ?? defaultSupabaseAnonKey,
    supabasePasswordResetRedirectUrl:
      pickFirstDefined(
        process.env.EXPO_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL,
        process.env.SUPABASE_PASSWORD_RESET_REDIRECT_URL,
      ) ?? defaultPasswordResetRedirectUrl,
  },
  plugins: [],
});
