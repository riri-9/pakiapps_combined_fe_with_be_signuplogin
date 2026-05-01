/// <reference types="jest" />
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should display the login screen after launch', async () => {
    await detoxExpect(element(by.id('login-screen'))).toBeVisible();
  });
});
