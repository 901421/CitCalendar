import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT') || 587;
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    if (!host) {
      this.logger.warn('EMAIL_HOST no está definido. Los correos se simularán en consola.');
      return;
    }

    const transportConfig: any = {
      host,
      port,
      secure: port === 465,
    };

    if (user && pass) {
      transportConfig.auth = { user, pass };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  /**
   * Send appointment confirmation email
   */
  async sendConfirmationEmail(
    to: string,
    clientName: string,
    businessName: string,
    details: {
      id: string;
      startTime: Date;
      servicesList: string;
      professionalName: string;
      totalPrice: number;
    },
  ) {
    const formattedDate = new Date(details.startTime).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid',
    });

    const subject = `Confirmación de Cita - ${businessName}`;
    const text = `Hola ${clientName},\n\nTu cita ha sido confirmada en ${businessName}.\n\nDetalles:\n- Servicio(s): ${details.servicesList}\n- Barbero: ${details.professionalName}\n- Fecha y Hora: ${formattedDate}\n- Total: ${details.totalPrice}€\n- ID de cita: ${details.id}\n\nTe esperamos!\n`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #131313; color: #e5e2e1; padding: 24px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
        <h2 style="color: #f2ca50; text-transform: uppercase; font-size: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">¡Cita Confirmada!</h2>
        <p style="font-size: 14px;">Hola <strong>${clientName}</strong>,</p>
        <p style="font-size: 14px;">Te confirmamos que tu cita en <strong>${businessName}</strong> ha sido agendada con éxito.</p>
        
        <div style="background-color: #1a1816; padding: 16px; border-radius: 6px; border: 1px solid #333; margin: 20px 0;">
          <h3 style="color: #f2ca50; margin-top: 0; font-size: 14px; text-transform: uppercase;">Detalles de la Reserva</h3>
          <table style="width: 100%; font-size: 13px; color: #ccc;">
            <tr>
              <td style="padding: 4px 0; color: #888; width: 120px;">Servicios:</td>
              <td style="padding: 4px 0; color: #fff; font-weight: bold;">${details.servicesList}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Barbero:</td>
              <td style="padding: 4px 0; color: #fff;">${details.professionalName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Fecha y Hora:</td>
              <td style="padding: 4px 0; color: #fff; font-weight: bold;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Importe Total:</td>
              <td style="padding: 4px 0; color: #f2ca50; font-weight: bold; font-size: 15px;">${details.totalPrice}€</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 12px; color: #888;">ID de Cita: <span style="font-family: monospace;">${details.id}</span></p>
        <p style="font-size: 13px; margin-top: 24px;">Si necesitas cancelar o reprogramar, ponte en contacto directo con nosotros. ¡Gracias por confiar en ${businessName}!</p>
      </div>
    `;

    await this.sendMail(to, subject, text, html);
  }

  /**
   * Send appointment reminder email (24h before)
   */
  async sendReminderEmail(
    to: string,
    clientName: string,
    businessName: string,
    details: {
      id: string;
      startTime: Date;
      servicesList: string;
      professionalName: string;
      totalPrice: number;
    },
  ) {
    const formattedDate = new Date(details.startTime).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid',
    });

    const subject = `Recordatorio de Cita - ${businessName}`;
    const text = `Hola ${clientName},\n\nEste es un recordatorio de tu cita de mañana en ${businessName}.\n\nDetalles:\n- Servicio(s): ${details.servicesList}\n- Barbero: ${details.professionalName}\n- Fecha y Hora: ${formattedDate}\n- Total: ${details.totalPrice}€\n\nTe esperamos!\n`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #131313; color: #e5e2e1; padding: 24px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
        <h2 style="color: #f2ca50; text-transform: uppercase; font-size: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">¡Recordatorio de Cita!</h2>
        <p style="font-size: 14px;">Hola <strong>${clientName}</strong>,</p>
        <p style="font-size: 14px;">Te recordamos que tienes una cita programada para mañana en <strong>${businessName}</strong>.</p>
        
        <div style="background-color: #1a1816; padding: 16px; border-radius: 6px; border: 1px solid #333; margin: 20px 0;">
          <h3 style="color: #f2ca50; margin-top: 0; font-size: 14px; text-transform: uppercase;">Detalles del Turno</h3>
          <table style="width: 100%; font-size: 13px; color: #ccc;">
            <tr>
              <td style="padding: 4px 0; color: #888; width: 120px;">Servicios:</td>
              <td style="padding: 4px 0; color: #fff; font-weight: bold;">${details.servicesList}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Barbero:</td>
              <td style="padding: 4px 0; color: #fff;">${details.professionalName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Fecha y Hora:</td>
              <td style="padding: 4px 0; color: #fff; font-weight: bold;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Importe Total:</td>
              <td style="padding: 4px 0; color: #f2ca50; font-weight: bold; font-size: 15px;">${details.totalPrice}€</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 13px; margin-top: 24px;">Si no puedes asistir, por favor infórmanos con la mayor brevedad posible. ¡Gracias!</p>
      </div>
    `;

    await this.sendMail(to, subject, text, html);
  }

  /**
   * Send waitlist notification email when a slot is freed
   */
  async sendWaitlistEmail(
    to: string,
    clientName: string,
    businessName: string,
    details: {
      date: string;
      time: string;
      professionalName: string;
      businessSlug: string;
    },
  ) {
    const subject = `¡Un hueco libre en ${businessName}!`;
    const text = `Hola ${clientName},\n\nTe informamos que se ha liberado un turno en ${businessName} el día ${details.date} a las ${details.time} con ${details.professionalName}.\n\nPuedes reservarlo ahora mismo antes de que se ocupe ingresando al portal de reservas.\n`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #131313; color: #e5e2e1; padding: 24px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
        <h2 style="color: #f2ca50; text-transform: uppercase; font-size: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">¡Hueco Disponible!</h2>
        <p style="font-size: 14px;">Hola <strong>${clientName}</strong>,</p>
        <p style="font-size: 14px;">Tenemos buenas noticias. Un turno se ha liberado y encaja con tu preferencia en <strong>${businessName}</strong>.</p>
        
        <div style="background-color: #1a1816; padding: 16px; border-radius: 6px; border: 1px solid #333; margin: 20px 0;">
          <h3 style="color: #f2ca50; margin-top: 0; font-size: 14px; text-transform: uppercase;">Detalles del Turno Libre</h3>
          <table style="width: 100%; font-size: 13px; color: #ccc;">
            <tr>
              <td style="padding: 4px 0; color: #888; width: 120px;">Profesional:</td>
              <td style="padding: 4px 0; color: #fff;">${details.professionalName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Fecha:</td>
              <td style="padding: 4px 0; color: #fff; font-weight: bold;">${details.date}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #888;">Hora:</td>
              <td style="padding: 4px 0; color: #fff; font-weight: bold;">${details.time}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; text-align: center; margin-top: 24px;">
          <a href="http://localhost:3000/${details.businessSlug}" style="background-color: #f2ca50; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Reservar Cita Ahora</a>
        </p>
        <p style="font-size: 11px; color: #888; margin-top: 24px; text-align: center;">Este es un aviso automático de lista de espera. Date prisa, el hueco puede ser reservado por otro cliente.</p>
      </div>
    `;

    await this.sendMail(to, subject, text, html);
  }

  private async sendMail(to: string, subject: string, text: string, html: string) {
    const from = this.configService.get<string>('EMAIL_FROM') || 'no-reply@citcalendar.com';

    if (!this.transporter) {
      this.logger.log(`[SIMULACIÓN EMAIL] De: ${from} | Para: ${to} | Asunto: ${subject}`);
      this.logger.log(`Cuerpo texto: ${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Email enviado con éxito a: ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error);
    }
  }
}
