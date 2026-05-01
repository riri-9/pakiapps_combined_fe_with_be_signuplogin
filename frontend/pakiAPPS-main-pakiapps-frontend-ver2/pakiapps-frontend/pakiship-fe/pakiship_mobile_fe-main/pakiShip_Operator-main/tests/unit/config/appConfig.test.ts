import { resolveEnvironment, getAppConfig } from '../../../src/config/appConfig';

describe('resolveEnvironment', () => {
  it('returns development for undefined', () => {
    expect(resolveEnvironment(undefined)).toBe('development');
  });

  it('returns development for unknown value', () => {
    expect(resolveEnvironment('unknown')).toBe('development');
  });

  it('returns staging for staging', () => {
    expect(resolveEnvironment('staging')).toBe('staging');
  });

  it('returns production for production', () => {
    expect(resolveEnvironment('production')).toBe('production');
  });
});

describe('getAppConfig', () => {
  it('returns a valid config object', () => {
    const config = getAppConfig();
    expect(config).toHaveProperty('appName');
    expect(config).toHaveProperty('environment');
    expect(config).toHaveProperty('apiBaseUrl');
  });
});
