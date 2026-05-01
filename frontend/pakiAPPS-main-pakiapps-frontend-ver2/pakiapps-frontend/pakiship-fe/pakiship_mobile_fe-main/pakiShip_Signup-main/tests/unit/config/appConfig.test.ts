/// <reference types="jest" />
import { appConfig } from '../../../src/config/appConfig';

describe('appConfig', () => {
  it('should be defined', () => {
    expect(appConfig).toBeDefined();
  });
});
