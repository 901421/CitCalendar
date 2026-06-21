import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { EmailService } from '../email/email.service';
import { WaitlistService } from '../waitlist/waitlist.service';

interface TimeRange {
  start: Date;
  end: Date;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly waitlistService: WaitlistService,
  ) {}

  /**
   * Get available slots for a business, service(s), date, and optional professional.
   */
  async getAvailability(dto: GetAvailabilityDto) {
    const { businessId, serviceIds, professionalId, date } = dto;

    // 1. Parse date (expected YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) {
      throw new BadRequestException('Formato de fecha inválido. Usar YYYY-MM-DD.');
    }

    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const dayOfWeek = dayStart.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    // 2. Fetch Business
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // 3. Resolve Services and compute total duration
    const idList = Array.from(new Set(serviceIds.split(',').map((id) => id.trim())));
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: idList },
        businessId,
        status: 'ACTIVE',
      },
    });

    if (services.length !== idList.length) {
      throw new BadRequestException('Uno o más servicios no se encontraron o están inactivos');
    }

    const totalDurationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);

    // 4. Find professionals who can perform ALL requested services
    const professionalFilter: any = {
      businessId,
      status: 'ACTIVE',
    };

    if (professionalId && professionalId !== 'any') {
      professionalFilter.id = professionalId;
    }

    // Query professionals including their services
    const activeProfessionals = await this.prisma.professional.findMany({
      where: professionalFilter,
      include: {
        services: true,
      },
    });

    // Filter to only those professionals who have all requested services
    const qualifiedProfessionals = activeProfessionals.filter((prof) => {
      const profServiceIds = prof.services.map((ps) => ps.serviceId);
      return idList.every((id) => profServiceIds.includes(id));
    });

    if (qualifiedProfessionals.length === 0) {
      return [];
    }

    const slotsMap: { [time: string]: { time: string; availableProfessionals: { id: string; name: string }[] } } = {};

    // 5. Calculate availability for each professional
    for (const prof of qualifiedProfessionals) {
      // Get schedule for this day of week
      const schedule = await this.prisma.professionalSchedule.findFirst({
        where: {
          professionalId: prof.id,
          dayOfWeek,
          isActive: true,
        },
      });

      if (!schedule) {
        continue; // Professional is not working this day
      }

      // Parse schedule times (e.g. "09:00" -> Date)
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);

      const workStart = new Date(Date.UTC(year, month - 1, day, startHour, startMin, 0, 0));
      const workEnd = new Date(Date.UTC(year, month - 1, day, endHour, endMin, 0, 0));

      // Get existing appointments
      const appointments = await this.prisma.appointment.findMany({
        where: {
          professionalId: prof.id,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          startTime: { lt: dayEnd },
          endTime: { gt: dayStart },
        },
      });

      // Get blocks
      const blocks = await this.prisma.professionalBlock.findMany({
        where: {
          professionalId: prof.id,
          startTime: { lt: dayEnd },
          endTime: { gt: dayStart },
        },
      });

      // Map busy ranges
      const busyRanges: TimeRange[] = [
        ...appointments.map((a) => ({ start: new Date(a.startTime), end: new Date(a.endTime) })),
        ...blocks.map((b) => ({ start: new Date(b.startTime), end: new Date(b.endTime) })),
      ];

      // 6. Generate 15-minute timeslots
      const stepMinutes = 15;
      const now = new Date(); // To filter out past slots if booking for today

      let current = new Date(workStart);

      while (current.getTime() + totalDurationMinutes * 60 * 1000 <= workEnd.getTime()) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + totalDurationMinutes * 60 * 1000);

        // Check against current real time (prevent booking past slots)
        if (slotStart.getTime() > now.getTime()) {
          // Check overlap with busy ranges
          const isOverlapping = busyRanges.some((busy) => {
            return slotStart.getTime() < busy.end.getTime() && slotEnd.getTime() > busy.start.getTime();
          });

          if (!isOverlapping) {
            const timeString = slotStart.toISOString(); // Use full ISO string to avoid ambiguities
            
            // Format readable time key (HH:MM in UTC)
            const hoursStr = String(slotStart.getUTCHours()).padStart(2, '0');
            const minsStr = String(slotStart.getUTCMinutes()).padStart(2, '0');
            const timeKey = `${hoursStr}:${minsStr}`;

            if (!slotsMap[timeKey]) {
              slotsMap[timeKey] = {
                time: timeKey,
                availableProfessionals: [],
              };
            }
            slotsMap[timeKey].availableProfessionals.push({
              id: prof.id,
              name: prof.name,
            });
          }
        }

        // Advance slot
        current = new Date(current.getTime() + stepMinutes * 60 * 1000);
      }
    }

    // Sort slots by time
    const sortedSlots = Object.values(slotsMap).sort((a, b) => a.time.localeCompare(b.time));
    return sortedSlots;
  }

  /**
   * Create an appointment
   */
  async createAppointment(dto: CreateAppointmentDto) {
    const {
      businessId,
      serviceIds,
      professionalId,
      startTime,
      clientName,
      clientPhone,
      clientEmail,
      notes,
    } = dto;

    // Deduplicate service IDs to avoid validation exceptions on duplicates
    const uniqueServiceIds = Array.from(new Set(serviceIds));

    // 1. Resolve business
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // 2. Resolve services
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: uniqueServiceIds },
        businessId,
        status: 'ACTIVE',
      },
    });

    if (services.length !== uniqueServiceIds.length) {
      throw new BadRequestException('Uno o más servicios no se encontraron o están inactivos');
    }

    const totalDurationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Formato de fecha y hora inválido');
    }
    // Validate that startTime is in the future
    if (start.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha y hora de la cita debe estar en el futuro');
    }
    const end = new Date(start.getTime() + totalDurationMinutes * 60 * 1000);
    const dayOfWeek = start.getUTCDay();

    // Perform database lookup and creation inside transaction to avoid race conditions (double-booking)
    const result = await this.prisma.$transaction(async (tx) => {
      // Find client or create one
      let client = await tx.client.findFirst({
        where: {
          businessId,
          phone: clientPhone,
        },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            businessId,
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            tags: ['NUEVO'],
          },
        });
      } else {
        // Update details if needed
        const dataToUpdate: any = {};
        if (clientName && client.name !== clientName) {
          dataToUpdate.name = clientName;
        }
        if (clientEmail && !client.email) {
          dataToUpdate.email = clientEmail;
        }
        if (Object.keys(dataToUpdate).length > 0) {
          client = await tx.client.update({
            where: { id: client.id },
            data: dataToUpdate,
          });
        }
      }

      // Find professionals who support all services
      const activeProfessionals = await tx.professional.findMany({
        where: {
          businessId,
          status: 'ACTIVE',
        },
        include: {
          services: true,
        },
      });

      const qualifiedProfessionals = activeProfessionals.filter((prof) => {
        const profServiceIds = prof.services.map((ps) => ps.serviceId);
        return uniqueServiceIds.every((id) => profServiceIds.includes(id));
      });

      if (qualifiedProfessionals.length === 0) {
        throw new BadRequestException('Ningún profesional activo realiza todos los servicios seleccionados');
      }

      let finalProfessionalId = '';

      if (professionalId === 'any') {
        // Find the first available professional
        for (const prof of qualifiedProfessionals) {
          // Lock professional row for update to prevent concurrent bookings
          await tx.$executeRawUnsafe(`SELECT id FROM "Professional" WHERE id = $1 FOR UPDATE`, prof.id);

          const isAvailable = await this.checkProfessionalAvailabilityTx(
            tx,
            prof.id,
            start,
            end,
            dayOfWeek,
          );
          if (isAvailable) {
            finalProfessionalId = prof.id;
            break;
          }
        }
        if (!finalProfessionalId) {
          throw new BadRequestException('No hay ningún profesional libre para el horario seleccionado');
        }
      } else {
        // Specific professional
        const selectedProf = qualifiedProfessionals.find((p) => p.id === professionalId);
        if (!selectedProf) {
          throw new BadRequestException('El profesional seleccionado no realiza estos servicios o está inactivo');
        }
        // Lock professional row for update to prevent concurrent bookings
        await tx.$executeRawUnsafe(`SELECT id FROM "Professional" WHERE id = $1 FOR UPDATE`, selectedProf.id);

        const isAvailable = await this.checkProfessionalAvailabilityTx(
          tx,
          selectedProf.id,
          start,
          end,
          dayOfWeek,
        );
        if (!isAvailable) {
          throw new BadRequestException('El profesional seleccionado no está disponible en este horario');
        }
        finalProfessionalId = selectedProf.id;
      }

      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          businessId,
          clientId: client.id,
          professionalId: finalProfessionalId,
          status: 'CONFIRMED',
          startTime: start,
          endTime: end,
          notes,
          totalPrice,
        },
        include: {
          client: true,
          professional: true,
        },
      });

      // Create AppointmentServices
      for (const service of services) {
        await tx.appointmentService.create({
          data: {
            appointmentId: appointment.id,
            serviceId: service.id,
            price: service.price,
            durationMinutes: service.durationMinutes,
          },
        });
      }

      return { appointment, client };
    });

    // Send confirmation email asynchronously (outside database lock transaction)
    if (result.client.email) {
      const servicesList = services.map((s) => s.name).join(', ');
      this.emailService
        .sendConfirmationEmail(result.client.email, result.client.name, business.name, {
          id: result.appointment.id,
          startTime: result.appointment.startTime,
          servicesList,
          professionalName: result.appointment.professional.name,
          totalPrice: Number(result.appointment.totalPrice),
        })
        .catch((err) => console.error('Error sending confirmation email:', err));
    }

    return {
      ...result.appointment,
      services: services,
    };
  }

  /**
   * List all appointments for a business with optional date filter (admin view)
   */
  async findAll(businessId: string, date?: string) {
    const whereClause: any = { businessId };

    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      if (year && month && day) {
        whereClause.startTime = {
          gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
          lte: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
        };
      }
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        professional: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Update appointment status (admin action)
   */
  async updateStatus(id: string, businessId: string, status: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, businessId },
    });

    if (!appt) {
      throw new NotFoundException('Cita no encontrada o no pertenece a este negocio');
    }

    const updatedAppt = await this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        professional: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    // Phase 2: Commission calculation hook
    if (status === 'COMPLETED') {
      const existingCommission = await this.prisma.commission.findFirst({
        where: { appointmentId: id },
      });

      if (!existingCommission) {
        const professional = await this.prisma.professional.findUnique({
          where: { id: updatedAppt.professionalId },
        });

        if (professional && Number(professional.commissionRate) > 0) {
          let commissionAmount = 0;
          const rateValue = Number(professional.commissionRate);
          const rateType = professional.commissionType; // PERCENT or FIXED
          const totalPrice = Number(updatedAppt.totalPrice);

          if (rateType === 'PERCENT') {
            commissionAmount = totalPrice * (rateValue / 100);
          } else {
            commissionAmount = rateValue;
          }

          await this.prisma.commission.create({
            data: {
              professionalId: professional.id,
              appointmentId: id,
              amount: commissionAmount,
              rateType,
              rateValue,
            },
          });
        }
      }
    } else {
      // If the status is moved away from COMPLETED, remove the commission
      await this.prisma.commission.deleteMany({
        where: { appointmentId: id },
      });
    }

    // Phase 2: Waitlist check hook
    if (status === 'CANCELLED') {
      await this.waitlistService.checkWaitlistAndNotify(id).catch((err) => {
        console.error('Error triggering waitlist notification:', err);
      });
    }

    return updatedAppt;
  }

  /**
   * Reschedule/move an appointment (admin action)
   */
  async reschedule(id: string, businessId: string, newStartTime: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, businessId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: true,
        professional: true,
        business: true,
      },
    });

    if (!appt) {
      throw new NotFoundException('Cita no encontrada o no pertenece a este negocio');
    }

    const start = new Date(newStartTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Formato de fecha y hora inválido');
    }
    
    // Check if new start time is in the future
    if (start.getTime() <= Date.now()) {
      throw new BadRequestException('La nueva fecha y hora debe estar en el futuro');
    }

    const totalDurationMinutes = appt.services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const end = new Date(start.getTime() + totalDurationMinutes * 60 * 1000);
    const dayOfWeek = start.getUTCDay();

    // Verify availability (ignoring this current appointment to avoid self-overlapping check!)
    const isAvailable = await this.checkProfessionalAvailabilityIgnoreSelf(
      appt.professionalId,
      start,
      end,
      dayOfWeek,
      id,
    );

    if (!isAvailable) {
      throw new BadRequestException('El profesional no está disponible en la nueva fecha y hora solicitada');
    }

    const updatedAppt = await this.prisma.appointment.update({
      where: { id },
      data: {
        startTime: start,
        endTime: end,
        emailReminderSent: false, // Reset reminder flag so they get the new reminder
      },
      include: {
        client: true,
        professional: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return updatedAppt;
  }

  /**
   * Helper to check if a professional is available in a given time slot
   */
  private async checkProfessionalAvailability(
    professionalId: string,
    start: Date,
    end: Date,
    dayOfWeek: number,
  ): Promise<boolean> {
    // 1. Get schedule for this day of week
    const schedule = await this.prisma.professionalSchedule.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      return false; // Not working this day
    }

    // Parse schedule times
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const workStart = new Date(start);
    workStart.setUTCHours(startHour, startMin, 0, 0);

    const workEnd = new Date(start);
    workEnd.setUTCHours(endHour, endMin, 0, 0);

    // Slot must fit within working hours
    if (start.getTime() < workStart.getTime() || end.getTime() > workEnd.getTime()) {
      return false;
    }

    // 2. Check overlap with appointments
    const overlappingAppt = await this.prisma.appointment.findFirst({
      where: {
        professionalId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingAppt) {
      return false;
    }

    // 3. Check overlap with blocks
    const overlappingBlock = await this.prisma.professionalBlock.findFirst({
      where: {
        professionalId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingBlock) {
      return false;
    }

    return true;
  }

  /**
   * Helper to check if a professional is available inside a database transaction block
   */
  private async checkProfessionalAvailabilityTx(
    tx: any,
    professionalId: string,
    start: Date,
    end: Date,
    dayOfWeek: number,
  ): Promise<boolean> {
    const schedule = await tx.professionalSchedule.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) return false;

    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const workStart = new Date(start);
    workStart.setUTCHours(startHour, startMin, 0, 0);

    const workEnd = new Date(start);
    workEnd.setUTCHours(endHour, endMin, 0, 0);

    if (start.getTime() < workStart.getTime() || end.getTime() > workEnd.getTime()) {
      return false;
    }

    const overlappingAppt = await tx.appointment.findFirst({
      where: {
        professionalId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingAppt) return false;

    const overlappingBlock = await tx.professionalBlock.findFirst({
      where: {
        professionalId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingBlock) return false;

    return true;
  }

  /**
   * Helper to check if a professional is available, ignoring a specific appointment (rescheduling)
   */
  private async checkProfessionalAvailabilityIgnoreSelf(
    professionalId: string,
    start: Date,
    end: Date,
    dayOfWeek: number,
    ignoreAppointmentId: string,
  ): Promise<boolean> {
    const schedule = await this.prisma.professionalSchedule.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) return false;

    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    const workStart = new Date(start);
    workStart.setUTCHours(startHour, startMin, 0, 0);

    const workEnd = new Date(start);
    workEnd.setUTCHours(endHour, endMin, 0, 0);

    if (start.getTime() < workStart.getTime() || end.getTime() > workEnd.getTime()) {
      return false;
    }

    const overlappingAppt = await this.prisma.appointment.findFirst({
      where: {
        id: { not: ignoreAppointmentId },
        professionalId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingAppt) return false;

    const overlappingBlock = await this.prisma.professionalBlock.findFirst({
      where: {
        professionalId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (overlappingBlock) return false;

    return true;
  }

  /**
   * Find all appointments for a client by phone number (public client portal)
   */
  async findClientAppointments(businessId: string, phone: string) {
    const client = await this.prisma.client.findFirst({
      where: { businessId, phone },
    });

    if (!client) {
      return [];
    }

    return this.prisma.appointment.findMany({
      where: {
        clientId: client.id,
        businessId,
      },
      include: {
        professional: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Client-initiated rescheduling (respecting 24h cancellation/change policy)
   */
  async clientReschedule(id: string, businessId: string, newStartTime: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, businessId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: true,
        professional: true,
        business: true,
      },
    });

    if (!appt) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Enforce 24-hour advance policy
    const now = Date.now();
    const apptStart = new Date(appt.startTime).getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    if (apptStart - now < twentyFourHoursMs) {
      throw new BadRequestException(
        'Las citas solo se pueden reprogramar con al menos 24 horas de anticipación.',
      );
    }

    const start = new Date(newStartTime);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Formato de fecha y hora inválido');
    }

    if (start.getTime() <= now) {
      throw new BadRequestException('La nueva fecha y hora debe estar en el futuro');
    }

    const totalDurationMinutes = appt.services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const end = new Date(start.getTime() + totalDurationMinutes * 60 * 1000);
    const dayOfWeek = start.getUTCDay();

    // Verify availability (ignoring self)
    const isAvailable = await this.checkProfessionalAvailabilityIgnoreSelf(
      appt.professionalId,
      start,
      end,
      dayOfWeek,
      id,
    );

    if (!isAvailable) {
      throw new BadRequestException('El estilista no está disponible en la nueva fecha/hora solicitada.');
    }

    const updatedAppt = await this.prisma.appointment.update({
      where: { id },
      data: {
        startTime: start,
        endTime: end,
        emailReminderSent: false,
      },
      include: {
        client: true,
        professional: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return updatedAppt;
  }

  /**
   * Client-initiated cancellation (respecting 24h cancellation/change policy)
   */
  async clientCancel(id: string, businessId: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, businessId },
    });

    if (!appt) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Enforce 24-hour advance policy
    const now = Date.now();
    const apptStart = new Date(appt.startTime).getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    if (apptStart - now < twentyFourHoursMs) {
      throw new BadRequestException(
        'Las citas solo se pueden cancelar con al menos 24 horas de anticipación.',
      );
    }

    // Cancel appointment using updateStatus to trigger waitlist automatically!
    return this.updateStatus(id, businessId, 'CANCELLED');
  }
}
