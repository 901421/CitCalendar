import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    const clients = await this.prisma.client.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { appointments: true },
        },
        appointments: {
          select: {
            totalPrice: true,
            startTime: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format output to include total spent & visit count for the CRM dashboard
    return clients.map((client) => {
      const visits = client._count.appointments;
      const totalSpent = client.appointments.reduce((sum, appt) => sum + Number(appt.totalPrice), 0);
      
      // Calculate last visit date
      let lastVisit = 'Nunca';
      if (client.appointments.length > 0) {
        const sortedDates = client.appointments
          .map((a) => new Date(a.startTime))
          .sort((a, b) => b.getTime() - a.getTime());
        lastVisit = sortedDates[0].toISOString().split('T')[0];
      }

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        tags: client.tags,
        visits,
        totalSpent,
        lastVisit,
        createdAt: client.createdAt,
      };
    });
  }

  async findOne(id: string, businessId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, businessId },
      include: {
        appointments: {
          include: {
            professional: true,
            services: {
              include: {
                service: true,
              },
            },
          },
          orderBy: {
            startTime: 'desc',
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const totalSpent = client.appointments.reduce((sum, appt) => sum + Number(appt.totalPrice), 0);

    return {
      ...client,
      totalSpent,
      visitsCount: client.appointments.length,
    };
  }

  async update(id: string, businessId: string, data: { name?: string; email?: string; phone?: string; notes?: string; tags?: string[] }) {
    const client = await this.prisma.client.findFirst({
      where: { id, businessId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  async create(businessId: string, data: { name: string; phone: string; email?: string; notes?: string; tags?: string[] }) {
    return this.prisma.client.create({
      data: {
        ...data,
        businessId,
      },
    });
  }
}
