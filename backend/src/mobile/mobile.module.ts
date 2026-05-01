import { Module } from '@nestjs/common';
import {
  InternalDriverController,
  MobileDriverController,
} from './mobile-driver.controller.js';
import { MobileDriverService } from './mobile-driver.service.js';
import { MobileNotificationsController } from './mobile-notifications.controller.js';
import { MobileNotificationsService } from './mobile-notifications.service.js';
import { MobileOperatorController } from './mobile-operator.controller.js';
import { MobileOperatorService } from './mobile-operator.service.js';
import { MobileParcelsController } from './mobile-parcels.controller.js';
import { MobileParcelsService } from './mobile-parcels.service.js';
import { MobilePricingController } from './mobile-pricing.controller.js';
import { MobilePricingService } from './mobile-pricing.service.js';

@Module({
  controllers: [
    MobileParcelsController,
    MobileDriverController,
    InternalDriverController,
    MobileOperatorController,
    MobileNotificationsController,
    MobilePricingController,
  ],
  providers: [
    MobileParcelsService,
    MobileDriverService,
    MobileOperatorService,
    MobileNotificationsService,
    MobilePricingService,
  ],
  exports: [MobileDriverService, MobileNotificationsService],
})
export class MobileModule {}
