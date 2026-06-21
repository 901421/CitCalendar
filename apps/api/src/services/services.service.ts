import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.service.findMany({
      where: { businessId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  async create(businessId: string, data: { name: string; description?: string; durationMinutes: number; price: number; category?: string }) {
    return this.prisma.service.create({
      data: {
        ...data,
        price: Number(data.price),
        businessId,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, businessId: string, data: { name?: string; description?: string; durationMinutes?: number; price?: number; category?: string }) {
    const service = await this.prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const updatedData: any = { ...data };
    if (data.price !== undefined) {
      updatedData.price = Number(data.price);
    }

    return this.prisma.service.update({
      where: { id },
      data: updatedData,
    });
  }

  async remove(id: string, businessId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Soft delete to protect database integrity on historical appointments
    return this.prisma.service.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
