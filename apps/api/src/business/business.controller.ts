import { Controller, Get, Param } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.businessService.findBySlug(slug);
  }
}
