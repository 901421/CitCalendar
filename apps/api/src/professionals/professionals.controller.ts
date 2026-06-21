import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AddBlockDto } from './dto/add-block.dto';

@UseGuards(JwtAuthGuard)
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  async findAll(@Request() req: any) {
    const businessId = req.user.businessId;
    return this.professionalsService.findAll(businessId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Request() req: any, @Body() body: CreateProfessionalDto) {
    const businessId = req.user.businessId;
    return this.professionalsService.create(businessId, body);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateProfessionalDto) {
    const businessId = req.user.businessId;
    return this.professionalsService.update(id, businessId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const businessId = req.user.businessId;
    return this.professionalsService.remove(id, businessId);
  }

  @Patch(':id/schedule')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateSchedule(@Param('id') id: string, @Request() req: any, @Body() body: UpdateScheduleDto) {
    const businessId = req.user.businessId;
    return this.professionalsService.updateSchedule(id, businessId, body.schedules);
  }

  @Post(':id/blocks')
  @UsePipes(new ValidationPipe({ transform: true }))
  async addBlock(@Param('id') id: string, @Request() req: any, @Body() body: AddBlockDto) {
    const businessId = req.user.businessId;
    return this.professionalsService.addBlock(id, businessId, body);
  }

  @Delete(':id/blocks/:blockId')
  async removeBlock(@Param('id') id: string, @Param('blockId') blockId: string, @Request() req: any) {
    const businessId = req.user.businessId;
    return this.professionalsService.removeBlock(blockId, id, businessId);
  }

  @Get(':id/commissions')
  async getCommissions(
    @Param('id') id: string,
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const businessId = req.user.businessId;
    return this.professionalsService.getCommissions(id, businessId, startDate, endDate);
  }
}
