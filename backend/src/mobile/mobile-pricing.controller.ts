import { Body, Controller, Post } from '@nestjs/common';
import { MOBILE_PREFIX } from './mobile.utils.js';
import { MobilePricingService } from './mobile-pricing.service.js';

@Controller(`${MOBILE_PREFIX}/pricing`)
export class MobilePricingController {
  constructor(private readonly pricingService: MobilePricingService) {}

  @Post('calculate')
  calculate(@Body() body: Record<string, unknown>) {
    return this.pricingService.calculate(body);
  }
}
