import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class WaitlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateWaitlistDto) {
    const {
      businessId,
      clientName,
      clientPhone,
      clientEmail,
      requestedDate,
      preferredStart,
      preferredEnd,
      professionalId,
    } = dto;

    // 1. Resolve business
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // 2. Resolve client or create
    let client = await this.prisma.client.findFirst({
      where: { businessId, phone: clientPhone },
    });

    if (!client) {
      client = await this.prisma.client.create({
        data: {
          businessId,
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          tags: ['NUEVO'],
        },
      });
    }

    // 3. Parse requestedDate (YYYY-MM-DD)
    const [year, month, day] = requestedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // 4. Create waitlist entry
    return this.prisma.waitlist.create({
      data: {
        businessId,
        clientId: client.id,
        requestedDate: dateObj,
        preferredStart,
        preferredEnd,
        professionalId: professionalId || null,
        status: 'WAITING',
      },
      include: {
        client: true,
      },
    });
  }

  async findAll(businessId: string) {
    return this.prisma.waitlist.findMany({
      where: { businessId },
      include: {
        client: true,
        professional: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: string, businessId: string) {
    const entry = await this.prisma.waitlist.findFirst({
      where: { id, businessId },
    });
    if (!entry) {
      throw new NotFoundException('Entrada de lista de espera no encontrada');
    }
    return this.prisma.waitlist.delete({
      where: { id },
    });
  }

  /**
   * Check waitlist when a slot is freed (appointment status CANCELLED)
   */
  async checkWaitlistAndNotify(appointmentId: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        professional: true,
        business: true,
      },
    });

    if (!appt) return;

    // Get date of appointment (UTC date portion)
    const apptDate = new Date(appt.startTime);
    const year = apptDate.getUTCFullYear();
    const month = apptDate.getUTCMonth();
    const datePart = apptDate.getUTCDate();
    const dayStart = new Date(Date.UTC(year, month, datePart, 0, 0, 0, 0));

    // Convert start time of appointment to minutes of the day (UTC)
    const apptHour = apptDate.getUTCHours();
    const apptMin = apptDate.getUTCMinutes();
    const apptTimeMinutes = apptHour * 60 + apptMin;

    // Find all waiting entries for this business and date
    const waitingEntries = await this.prisma.waitlist.findMany({
      where: {
        businessId: appt.businessId,
        requestedDate: dayStart,
        status: 'WAITING',
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Find the first match that fits
    for (const entry of waitingEntries) {
      // Check professional preference
      if (entry.professionalId && entry.professionalId !== appt.professionalId) {
        continue; // Doesn't match professional preference
      }

      // Check time range fit
      const [startHour, startMin] = entry.preferredStart.split(':').map(Number);
      const startMinOfDay = startHour * 60 + startMin;

      const [endHour, endMin] = entry.preferredEnd.split(':').map(Number);
      const endMinOfDay = endHour * 60 + endMin;

      if (apptTimeMinutes >= startMinOfDay && apptTimeMinutes <= endMinOfDay) {
        // We found a match! Notify client via email
        if (entry.client.email) {
          const formattedTime = `${String(apptHour).padStart(2, '0')}:${String(apptMin).padStart(2, '0')}`;
          const dateStr = apptDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });

          await this.emailService
            .sendWaitlistEmail(entry.client.email, entry.client.name, appt.business.name, {
              date: dateStr,
              time: formattedTime,
              professionalName: appt.professional.name,
              businessSlug: appt.business.slug,
            })
            .catch((err) => console.error('Error sending waitlist email:', err));
        }

        // Update waitlist entry status to NOTIFIED
        await this.prisma.waitlist.update({
          where: { id: entry.id },
          data: { status: 'NOTIFIED' },
        });

        // Break after the first match to not spam multiple clients for one slot
        break;
      }
    }
  }
}
