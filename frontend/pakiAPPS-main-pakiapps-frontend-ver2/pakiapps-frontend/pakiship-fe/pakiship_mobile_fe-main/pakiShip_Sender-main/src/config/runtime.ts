import Constants from 'expo-constants';

type ExpoExtra = {
  apiBaseUrl?: string;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

function normalizeApiBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\/+$/, '');
}

function getExpoHostApiBaseUrl(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri?.trim();
  if (!hostUri) {
    return undefined;
  }

  const normalizedHostUri = hostUri.includes('://') ? hostUri : `exp://${hostUri}`;

  try {
    const parsed = new URL(normalizedHostUri);
    const host = parsed.hostname;

    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return undefined;
    }

    return `http://${host}:3000/api/v1`;
  } catch {
    return undefined;
  }
}

function resolveApiBaseUrl(): string {
  const configuredApiBaseUrl = normalizeApiBaseUrl(extra.apiBaseUrl);

  if (
    configuredApiBaseUrl &&
    !/^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(configuredApiBaseUrl)
  ) {
    return configuredApiBaseUrl;
  }

  return getExpoHostApiBaseUrl() ?? configuredApiBaseUrl ?? 'http://127.0.0.1:3000/api/v1';
}

export const runtimeConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  supabaseUrl: extra.supabaseUrl ?? '',
  supabasePublishableKey: extra.supabasePublishableKey ?? '',
};
