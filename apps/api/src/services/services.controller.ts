import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll(@Request() req: any) {
    const businessId = req.user.businessId;
    return this.servicesService.findAll(businessId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Request() req: any, @Body() body: CreateServiceDto) {
    const businessId = req.user.businessId;
    return this.servicesService.create(businessId, body);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateServiceDto) {
    const businessId = req.user.businessId;
    return this.servicesService.update(id, businessId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const businessId = req.user.businessId;
    return this.servicesService.remove(id, businessId);
  }
}
