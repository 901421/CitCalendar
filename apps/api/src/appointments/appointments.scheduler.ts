import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsScheduler {
  private readonly logger = new Logger(AppointmentsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Cron task running every 15 minutes to check for appointments starting in 24 hours.
   */
  @Cron('0 */15 * * * *') // Runs every 15 minutes
  async sendUpcomingReminders() {
    this.logger.log('Iniciando escaneo de recordatorios de citas...');

    const now = new Date();
    // Range of search: appointments starting between 23.5 and 24.5 hours from now
    const minTime = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          status: 'CONFIRMED',
          emailReminderSent: false,
          startTime: {
            gte: minTime,
            lte: maxTime,
          },
        },
        include: {
          client: true,
          professional: true,
          business: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      });

      if (appointments.length === 0) {
        this.logger.log('No se encontraron citas próximas que requieran recordatorio.');
        return;
      }

      this.logger.log(`Encontradas ${appointments.length} citas para enviar recordatorio.`);

      for (const appt of appointments) {
        if (appt.client.email) {
          const servicesList = appt.services.map((s) => s.service.name).join(', ');
          
          await this.emailService.sendReminderEmail(
            appt.client.email,
            appt.client.name,
            appt.business.name,
            {
              id: appt.id,
              startTime: appt.startTime,
              servicesList,
              professionalName: appt.professional.name,
              totalPrice: Number(appt.totalPrice),
            },
          );

          // Mark as sent
          await this.prisma.appointment.update({
            where: { id: appt.id },
            data: { emailReminderSent: true },
          });

          this.logger.log(`Recordatorio enviado y registrado para cita ID: ${appt.id}`);
        } else {
          // If no email, just mark as sent so we don't query it again
          await this.prisma.appointment.update({
            where: { id: appt.id },
            data: { emailReminderSent: true },
          });
          this.logger.log(`Cita ID: ${appt.id} omitida (cliente sin email). Marcado como procesada.`);
        }
      }
    } catch (error) {
      this.logger.error('Error al procesar recordatorios automáticos de citas:', error);
    }
  }
}
