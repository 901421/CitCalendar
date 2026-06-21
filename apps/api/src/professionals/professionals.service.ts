import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.professional.findMany({
      where: { businessId, status: 'ACTIVE' },
      include: {
        schedules: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    businessId: string,
    data: {
      name: string;
      photoUrl?: string;
      bio?: string;
      commissionRate?: number;
      commissionType?: string;
      serviceIds?: string[];
    },
  ) {
    const { serviceIds, ...profData } = data;

    const professional = await this.prisma.professional.create({
      data: {
        ...profData,
        businessId,
        status: 'ACTIVE',
      },
    });

    // Link services if provided
    if (serviceIds && serviceIds.length > 0) {
      for (const sId of serviceIds) {
        await this.prisma.professionalService.create({
          data: {
            professionalId: professional.id,
            serviceId: sId,
          },
        });
      }
    }

    // Initialize default schedule (Mon-Sat 09:00 to 20:00)
    for (let day = 1; day <= 6; day++) {
      await this.prisma.professionalSchedule.create({
        data: {
          professionalId: professional.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '20:00',
          isActive: true,
        },
      });
    }

    return this.prisma.professional.findUnique({
      where: { id: professional.id },
      include: { schedules: true, services: true },
    });
  }

  async update(
    id: string,
    businessId: string,
    data: {
      name?: string;
      photoUrl?: string;
      bio?: string;
      commissionRate?: number;
      commissionType?: string;
      serviceIds?: string[];
    },
  ) {
    const prof = await this.prisma.professional.findFirst({
      where: { id, businessId },
    });

    if (!prof) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const { serviceIds, ...profData } = data;

    const updated = await this.prisma.professional.update({
      where: { id },
      data: profData,
    });

    // Update services if list provided
    if (serviceIds) {
      // Clear current service associations
      await this.prisma.professionalService.deleteMany({
        where: { professionalId: id },
      });

      // Link new services
      for (const sId of serviceIds) {
        await this.prisma.professionalService.create({
          data: {
            professionalId: id,
            serviceId: sId,
          },
        });
      }
    }

    return this.prisma.professional.findUnique({
      where: { id },
      include: { schedules: true, services: true },
    });
  }

  async remove(id: string, businessId: string) {
    const prof = await this.prisma.professional.findFirst({
      where: { id, businessId },
    });

    if (!prof) {
      throw new NotFoundException('Profesional no encontrado');
    }

    // Soft delete to protect database integrity on historical appointments
    return this.prisma.professional.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async updateSchedule(
    id: string,
    businessId: string,
    schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[],
  ) {
    const prof = await this.prisma.professional.findFirst({
      where: { id, businessId },
    });

    if (!prof) {
      throw new NotFoundException('Profesional no encontrado');
    }

    for (const sched of schedules) {
      const existing = await this.prisma.professionalSchedule.findFirst({
        where: { professionalId: id, dayOfWeek: sched.dayOfWeek },
      });

      if (existing) {
        await this.prisma.professionalSchedule.update({
          where: { id: existing.id },
          data: {
            startTime: sched.startTime,
            endTime: sched.endTime,
            isActive: sched.isActive,
          },
        });
      } else {
        await this.prisma.professionalSchedule.create({
          data: {
            professionalId: id,
            dayOfWeek: sched.dayOfWeek,
            startTime: sched.startTime,
            endTime: sched.endTime,
            isActive: sched.isActive,
          },
        });
      }
    }

    return this.prisma.professionalSchedule.findMany({
      where: { professionalId: id },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async addBlock(
    id: string,
    businessId: string,
    data: { startTime: string; endTime: string; reason?: string },
  ) {
    const prof = await this.prisma.professional.findFirst({
      where: { id, businessId },
    });

    if (!prof) {
      throw new NotFoundException('Profesional no encontrado');
    }

    return this.prisma.professionalBlock.create({
      data: {
        professionalId: id,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        reason: data.reason,
      },
    });
  }

  async removeBlock(blockId: string, professionalId: string, businessId: string) {
    const prof = await this.prisma.professional.findFirst({
      where: { id: professionalId, businessId },
    });

    if (!prof) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const block = await this.prisma.professionalBlock.findFirst({
      where: { id: blockId, professionalId },
    });

    if (!block) {
      throw new NotFoundException('Bloqueo de agenda no encontrado');
    }

    return this.prisma.professionalBlock.delete({
      where: { id: blockId },
    });
  }

  async getCommissions(
    professionalId: string,
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const prof = await this.prisma.professional.findFirst({
      where: { id: professionalId, businessId },
    });

    if (!prof) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const whereClause: any = {
      professionalId,
    };

    if (startDate || endDate) {
      whereClause.calculatedAt = {};
      if (startDate) {
        whereClause.calculatedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.calculatedAt.lte = new Date(endDate);
      }
    }

    const commissions = await this.prisma.commission.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { calculatedAt: 'desc' },
    });

    const totalAmount = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      professional: { id: prof.id, name: prof.name },
      totalAmount,
      commissions,
    };
  }
}
