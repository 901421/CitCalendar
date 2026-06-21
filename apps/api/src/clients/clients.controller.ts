import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@Request() req: any) {
    const businessId = req.user.businessId;
    return this.clientsService.findAll(businessId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Request() req: any, @Body() body: CreateClientDto) {
    const businessId = req.user.businessId;
    return this.clientsService.create(businessId, body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const businessId = req.user.businessId;
    return this.clientsService.findOne(id, businessId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Request() req: any, @Body() body: UpdateClientDto) {
    const businessId = req.user.businessId;
    return this.clientsService.update(id, businessId, body);
  }
}
