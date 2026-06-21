import { Controller, Get, Post, Patch, Body, Query, UsePipes, ValidationPipe, UseGuards, Request, Param } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('availability')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAvailability(@Query() query: GetAvailabilityDto) {
    return this.appointmentsService.getAvailability(query);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAppointment(@Body() body: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAppointments(@Request() req: any, @Query('date') date?: string) {
    const businessId = req.user.businessId;
    return this.appointmentsService.findAll(businessId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body('status') status: string,
  ) {
    const businessId = req.user.businessId;
    return this.appointmentsService.updateStatus(id, businessId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async reschedule(
    @Param('id') id: string,
    @Request() req: any,
    @Body('startTime') startTime: string,
  ) {
    const businessId = req.user.businessId;
    return this.appointmentsService.reschedule(id, businessId, startTime);
  }

  @Get('client-portal')
  async getClientAppointments(
    @Query('phone') phone: string,
    @Query('businessId') businessId: string,
  ) {
    return this.appointmentsService.findClientAppointments(businessId, phone);
  }

  @Patch('client-portal/:id/reschedule')
  async clientReschedule(
    @Param('id') id: string,
    @Body('businessId') businessId: string,
    @Body('startTime') startTime: string,
  ) {
    return this.appointmentsService.clientReschedule(id, businessId, startTime);
  }

  @Patch('client-portal/:id/cancel')
  async clientCancel(
    @Param('id') id: string,
    @Body('businessId') businessId: string,
  ) {
    return this.appointmentsService.clientCancel(id, businessId);
  }
}

