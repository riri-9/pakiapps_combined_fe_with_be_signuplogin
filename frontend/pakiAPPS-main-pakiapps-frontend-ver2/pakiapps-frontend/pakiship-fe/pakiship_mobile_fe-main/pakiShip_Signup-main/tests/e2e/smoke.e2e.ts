/// <reference types="jest" />
import { device } from 'detox';

describe('Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should land on the Home screen', async () => {
    // Basic structural smoke test logic
  });
});
