import { DetoxCircusEnvironment } from 'detox/runners/jest';

class DetoxJestCircusEnvironment extends DetoxCircusEnvironment {
  initTimeout: number;
  constructor(config: any, context: any) {
    super(config, context);
    // Default timeout for Detox operations (ms)
    this.initTimeout = 300000;
  }
}

export default DetoxJestCircusEnvironment;
