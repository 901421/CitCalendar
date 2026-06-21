import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;
  let emailService: EmailService;
  let waitlistService: WaitlistService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    $executeRawUnsafe: jest.fn().mockResolvedValue([]),
    business: {
      findUnique: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
    },
    professional: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    professionalSchedule: {
      findFirst: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    professionalBlock: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    client: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    appointmentService: {
      create: jest.fn(),
    },
    commission: {
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockWaitlistService = {
    checkWaitlistAndNotify: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: WaitlistService,
          useValue: mockWaitlistService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    waitlistService = module.get<WaitlistService>(WaitlistService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getAvailability', () => {
    const defaultDto = {
      businessId: 'business-1',
      serviceIds: 'service-1',
      date: '2026-06-21', // June 21, 2026 (Sunday, DayOfWeek = 0)
    };

    const mockBusiness = { id: 'business-1', name: 'Barber Shop' };
    const mockServices = [
      { id: 'service-1', name: 'Haircut', durationMinutes: 30, price: 20, businessId: 'business-1', status: 'ACTIVE' },
    ];
    const mockProfessionals = [
      {
        id: 'prof-1',
        name: 'John Doe',
        businessId: 'business-1',
        status: 'ACTIVE',
        services: [{ serviceId: 'service-1' }],
      },
    ];
    const mockSchedule = {
      professionalId: 'prof-1',
      dayOfWeek: 0,
      isActive: true,
      startTime: '09:00',
      endTime: '11:00',
    };

    beforeEach(() => {
      // Setup default mock resolves for standard success path
      mockPrismaService.business.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.service.findMany.mockResolvedValue(mockServices);
      mockPrismaService.professional.findMany.mockResolvedValue(mockProfessionals);
      mockPrismaService.professionalSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.appointment.findMany.mockResolvedValue([]);
      mockPrismaService.professionalBlock.findMany.mockResolvedValue([]);
    });

    it('should throw BadRequestException if date format is invalid', async () => {
      await expect(
        service.getAvailability({ ...defaultDto, date: 'invalid-date' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if business is not found', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);
      await expect(service.getAvailability(defaultDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if a service is not found or inactive', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([]);
      await expect(service.getAvailability(defaultDto)).rejects.toThrow(BadRequestException);
    });

    it('should return empty array if no active qualified professionals found', async () => {
      mockPrismaService.professional.findMany.mockResolvedValue([]);
      const result = await service.getAvailability(defaultDto);
      expect(result).toEqual([]);
    });

    it('should generate available slots within schedule limits in the future', async () => {
      // Mock system time to be before any slot starts (e.g. 08:00 UTC)
      jest.useFakeTimers({
        now: new Date('2026-06-21T08:00:00Z'),
      });

      const result = await service.getAvailability(defaultDto);

      // Schedule is 09:00 - 11:00 (2 hours = 120 minutes)
      // Service is 30 mins, step is 15 mins.
      // Expected starts: 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, 10:30.
      expect(result).toHaveLength(7);
      expect(result[0]).toEqual({
        time: '09:00',
        availableProfessionals: [{ id: 'prof-1', name: 'John Doe' }],
      });
      expect(result[6]).toEqual({
        time: '10:30',
        availableProfessionals: [{ id: 'prof-1', name: 'John Doe' }],
      });
    });

    it('should filter out slots that overlap with existing appointments', async () => {
      jest.useFakeTimers({
        now: new Date('2026-06-21T08:00:00Z'),
      });

      // Existing appointment: 09:30 - 10:00
      mockPrismaService.appointment.findMany.mockResolvedValue([
        {
          id: 'appt-1',
          professionalId: 'prof-1',
          startTime: new Date('2026-06-21T09:30:00Z'),
          endTime: new Date('2026-06-21T10:00:00Z'),
          status: 'CONFIRMED',
        },
      ]);

      const result = await service.getAvailability(defaultDto);

      // Expected starts remaining:
      // 09:00 (09:00-09:30 - no overlap) -> Keep
      // 09:15 (09:15-09:45 - overlaps with 09:30-10:00) -> Filter out
      // 09:30 (09:30-10:00 - overlaps) -> Filter out
      // 09:45 (09:45-10:15 - overlaps) -> Filter out
      // 10:00 (10:00-10:30 - no overlap) -> Keep
      // 10:15 (10:15-10:45 - no overlap) -> Keep
      // 10:30 (10:30-11:00 - no overlap) -> Keep
      const availableTimes = result.map((r) => r.time);
      expect(availableTimes).toEqual(['09:00', '10:00', '10:15', '10:30']);
    });

    it('should filter out slots that overlap with professional blocks', async () => {
      jest.useFakeTimers({
        now: new Date('2026-06-21T08:00:00Z'),
      });

      // Block: 10:15 - 10:45
      mockPrismaService.professionalBlock.findMany.mockResolvedValue([
        {
          id: 'block-1',
          professionalId: 'prof-1',
          startTime: new Date('2026-06-21T10:15:00Z'),
          endTime: new Date('2026-06-21T10:45:00Z'),
        },
      ]);

      const result = await service.getAvailability(defaultDto);

      // Expected starts remaining:
      // 09:00, 09:15, 09:30, 09:45 -> Keep
      // 10:00 (10:00-10:30 - overlaps with block start 10:15) -> Filter out
      // 10:15 (10:15-10:45 - overlaps) -> Filter out
      // 10:30 (10:30-11:00 - overlaps with block end 10:45) -> Filter out
      const availableTimes = result.map((r) => r.time);
      expect(availableTimes).toEqual(['09:00', '09:15', '09:30', '09:45']);
    });

    it('should filter out slots that are in the past', async () => {
      // Mock system time to be inside the schedule, e.g., 09:30 UTC
      jest.useFakeTimers({
        now: new Date('2026-06-21T09:30:00Z'),
      });

      const result = await service.getAvailability(defaultDto);

      // Since now is 09:30:
      // slotStart > now:
      // - 09:00, 09:15, 09:30 are <= 09:30 -> Filter out
      // - 09:45, 10:00, 10:15, 10:30 are > 09:30 -> Keep
      const availableTimes = result.map((r) => r.time);
      expect(availableTimes).toEqual(['09:45', '10:00', '10:15', '10:30']);
    });
  });

  describe('createAppointment', () => {
    const createDto = {
      businessId: 'business-1',
      serviceIds: ['service-1'],
      professionalId: 'prof-1',
      startTime: '2026-06-21T10:00:00Z', // 10:00 UTC (future relative to fake timer)
      clientName: 'Alice',
      clientPhone: '123456789',
      clientEmail: 'alice@example.com',
      notes: 'Some notes',
    };

    const mockBusiness = { id: 'business-1', name: 'Barber Shop' };
    const mockServices = [
      { id: 'service-1', name: 'Haircut', durationMinutes: 30, price: '20.00', businessId: 'business-1', status: 'ACTIVE' },
    ];
    const mockProfessionals = [
      {
        id: 'prof-1',
        name: 'John Doe',
        businessId: 'business-1',
        status: 'ACTIVE',
        services: [{ serviceId: 'service-1' }],
      },
    ];
    const mockSchedule = {
      professionalId: 'prof-1',
      dayOfWeek: 0, // Sunday
      isActive: true,
      startTime: '09:00',
      endTime: '11:00',
    };
    const mockClient = {
      id: 'client-1',
      businessId: 'business-1',
      name: 'Alice',
      phone: '123456789',
      email: 'alice@example.com',
    };
    const mockAppointment = {
      id: 'appt-1',
      businessId: 'business-1',
      clientId: 'client-1',
      professionalId: 'prof-1',
      status: 'CONFIRMED',
      startTime: new Date('2026-06-21T10:00:00Z'),
      endTime: new Date('2026-06-21T10:30:00Z'),
      notes: 'Some notes',
      totalPrice: 20.00,
      client: mockClient,
      professional: { name: 'John Doe' },
    };

    beforeEach(() => {
      jest.useFakeTimers({
        now: new Date('2026-06-21T08:00:00Z'),
      });
      mockPrismaService.business.findUnique.mockResolvedValue(mockBusiness);
      mockPrismaService.service.findMany.mockResolvedValue(mockServices);
      mockPrismaService.professional.findMany.mockResolvedValue(mockProfessionals);
      mockPrismaService.professionalSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.appointment.findFirst.mockResolvedValue(null); // no overlaps
      mockPrismaService.professionalBlock.findFirst.mockResolvedValue(null);
      mockPrismaService.client.findFirst.mockResolvedValue(null); // new client
      mockPrismaService.client.create.mockResolvedValue(mockClient);
      mockPrismaService.client.update.mockResolvedValue(mockClient);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);
      mockPrismaService.appointmentService.create.mockResolvedValue({});
    });

    it('should throw NotFoundException if business is not found', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);
      await expect(service.createAppointment(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if a service is not found or inactive', async () => {
      mockPrismaService.service.findMany.mockResolvedValue([]);
      await expect(service.createAppointment(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if startTime is in the past', async () => {
      const pastDto = { ...createDto, startTime: '2026-06-21T07:59:00Z' };
      await expect(service.createAppointment(pastDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no professional performs all services', async () => {
      mockPrismaService.professional.findMany.mockResolvedValue([]);
      await expect(service.createAppointment(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if professional is not available (e.g. out of work hours)', async () => {
      const outOfHoursDto = { ...createDto, startTime: '2026-06-21T11:30:00Z' };
      await expect(service.createAppointment(outOfHoursDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if professional is busy with overlapping appointment', async () => {
      mockPrismaService.appointment.findFirst.mockResolvedValue({ id: 'existing-appt' });
      await expect(service.createAppointment(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully create client and appointment, and send confirmation email', async () => {
      const result = await service.createAppointment(createDto);
      expect(result.id).toEqual('appt-1');
      expect(mockPrismaService.client.create).toHaveBeenCalled();
      expect(mockPrismaService.appointment.create).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
        'alice@example.com',
        'Alice',
        'Barber Shop',
        expect.any(Object)
      );
    });

    it('should update client details if client exists but name differs', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue({
        id: 'client-1',
        name: 'Alice OldName',
        phone: '123456789',
        email: null,
      });
      const result = await service.createAppointment(createDto);
      expect(result.id).toEqual('appt-1');
      expect(mockPrismaService.client.update).toHaveBeenCalled();
    });

    it('should assign first available professional when professionalId is "any"', async () => {
      const anyDto = { ...createDto, professionalId: 'any' };
      const result = await service.createAppointment(anyDto);
      expect(result.id).toEqual('appt-1');
      expect(mockPrismaService.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            professionalId: 'prof-1',
          }),
        })
      );
    });
  });

  describe('findAll', () => {
    it('should list all appointments for businessId without date filter', async () => {
      mockPrismaService.appointment.findMany.mockResolvedValue([{ id: 'appt-1' }]);
      const result = await service.findAll('business-1');
      expect(result).toHaveLength(1);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: { businessId: 'business-1' },
        include: expect.any(Object),
        orderBy: { startTime: 'asc' },
      });
    });

    it('should list and filter appointments by date range', async () => {
      mockPrismaService.appointment.findMany.mockResolvedValue([{ id: 'appt-1' }]);
      await service.findAll('business-1', '2026-06-21');
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: {
          businessId: 'business-1',
          startTime: {
            gte: new Date(Date.UTC(2026, 5, 21, 0, 0, 0, 0)),
            lte: new Date(Date.UTC(2026, 5, 21, 23, 59, 59, 999)),
          },
        },
        include: expect.any(Object),
        orderBy: { startTime: 'asc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if appointment does not exist or belongs to another business', async () => {
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);
      await expect(service.updateStatus('appt-1', 'business-1', 'COMPLETED')).rejects.toThrow(NotFoundException);
    });

    it('should update appointment status successfully', async () => {
      const mockAppt = { id: 'appt-1', businessId: 'business-1', status: 'CONFIRMED' };
      mockPrismaService.appointment.findFirst.mockResolvedValue(mockAppt);
      mockPrismaService.appointment.update.mockResolvedValue({ ...mockAppt, status: 'COMPLETED' });

      const result = await service.updateStatus('appt-1', 'business-1', 'COMPLETED');
      expect(result.status).toEqual('COMPLETED');
      expect(mockPrismaService.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { status: 'COMPLETED' },
        include: expect.any(Object),
      });
    });
  });

  describe('reschedule', () => {
    const mockAppt = {
      id: 'appt-1',
      businessId: 'business-1',
      professionalId: 'prof-1',
      services: [{ durationMinutes: 30 }],
    };
    const mockSchedule = {
      professionalId: 'prof-1',
      dayOfWeek: 0,
      isActive: true,
      startTime: '09:00',
      endTime: '11:00',
    };

    beforeEach(() => {
      jest.useFakeTimers({
        now: new Date('2026-06-21T08:00:00Z'),
      });
      mockPrismaService.appointment.findFirst.mockResolvedValueOnce(mockAppt).mockResolvedValue(null);
      mockPrismaService.professionalSchedule.findFirst.mockResolvedValue(mockSchedule);
      mockPrismaService.appointment.update.mockResolvedValue({ ...mockAppt, startTime: new Date('2026-06-21T10:00:00Z') });
      mockPrismaService.professionalBlock.findFirst.mockResolvedValue(null);
    });

    it('should throw NotFoundException if appointment is not found or belongs to another business', async () => {
      mockPrismaService.appointment.findFirst.mockReset();
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);
      await expect(service.reschedule('appt-1', 'business-1', '2026-06-21T10:00:00Z')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if rescheduling to a past date', async () => {
      await expect(service.reschedule('appt-1', 'business-1', '2026-06-21T07:59:00Z')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if professional is not available at the new time', async () => {
      // Out of schedule hours
      await expect(service.reschedule('appt-1', 'business-1', '2026-06-21T11:30:00Z')).rejects.toThrow(BadRequestException);
    });

    it('should reschedule successfully and reset emailReminderSent', async () => {
      const result = await service.reschedule('appt-1', 'business-1', '2026-06-21T10:00:00Z');
      expect(result).toBeDefined();
      expect(mockPrismaService.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: {
          startTime: new Date('2026-06-21T10:00:00Z'),
          endTime: new Date('2026-06-21T10:30:00Z'),
          emailReminderSent: false,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('Phase 2 - Commissions & Waitlist', () => {
    describe('updateStatus - commissions', () => {
      it('should calculate and create commission when appointment is completed', async () => {
        const mockAppt = {
          id: 'appt-1',
          businessId: 'business-1',
          professionalId: 'prof-1',
          totalPrice: 100,
          status: 'PENDING',
        };

        const mockProf = {
          id: 'prof-1',
          commissionRate: 20,
          commissionType: 'PERCENT',
        };

        mockPrismaService.appointment.findFirst.mockResolvedValueOnce(mockAppt);
        mockPrismaService.appointment.update.mockResolvedValueOnce({ ...mockAppt, status: 'COMPLETED' });
        mockPrismaService.commission.findFirst.mockResolvedValueOnce(null);
        mockPrismaService.professional.findUnique.mockResolvedValueOnce(mockProf);

        const result = await service.updateStatus('appt-1', 'business-1', 'COMPLETED');

        expect(result.status).toBe('COMPLETED');
        expect(mockPrismaService.commission.create).toHaveBeenCalledWith({
          data: {
            professionalId: 'prof-1',
            appointmentId: 'appt-1',
            amount: 20,
            rateType: 'PERCENT',
            rateValue: 20,
          },
        });
      });

      it('should remove commission when status is moved away from COMPLETED', async () => {
        const mockAppt = {
          id: 'appt-1',
          businessId: 'business-1',
          professionalId: 'prof-1',
          totalPrice: 100,
          status: 'COMPLETED',
        };

        mockPrismaService.appointment.findFirst.mockResolvedValueOnce(mockAppt);
        mockPrismaService.appointment.update.mockResolvedValueOnce({ ...mockAppt, status: 'CANCELLED' });

        await service.updateStatus('appt-1', 'business-1', 'CANCELLED');

        expect(mockPrismaService.commission.deleteMany).toHaveBeenCalledWith({
          where: { appointmentId: 'appt-1' },
        });
      });
    });

    describe('updateStatus - waitlist', () => {
      it('should check waitlist when status is set to CANCELLED', async () => {
        const mockAppt = {
          id: 'appt-1',
          businessId: 'business-1',
          professionalId: 'prof-1',
          totalPrice: 100,
          status: 'CONFIRMED',
        };

        mockPrismaService.appointment.findFirst.mockResolvedValueOnce(mockAppt);
        mockPrismaService.appointment.update.mockResolvedValueOnce({ ...mockAppt, status: 'CANCELLED' });

        await service.updateStatus('appt-1', 'business-1', 'CANCELLED');

        expect(mockWaitlistService.checkWaitlistAndNotify).toHaveBeenCalledWith('appt-1');
      });
    });

    describe('clientPortal', () => {
      it('should find client appointments by phone', async () => {
        mockPrismaService.client.findFirst.mockResolvedValueOnce({ id: 'client-1' });
        mockPrismaService.appointment.findMany.mockResolvedValueOnce([{ id: 'appt-1' }]);

        const result = await service.findClientAppointments('business-1', '123456789');

        expect(result).toHaveLength(1);
        expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
          where: { businessId: 'business-1', phone: '123456789' },
        });
      });

      it('should enforce 24-hour limit on rescheduling', async () => {
        const mockAppt = {
          id: 'appt-1',
          businessId: 'business-1',
          startTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // starts in 12 hours
          services: [],
        };
        mockPrismaService.appointment.findFirst.mockResolvedValueOnce(mockAppt);

        await expect(service.clientReschedule('appt-1', 'business-1', new Date().toISOString())).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should enforce 24-hour limit on cancellation', async () => {
        const mockAppt = {
          id: 'appt-1',
          businessId: 'business-1',
          startTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // starts in 12 hours
        };
        mockPrismaService.appointment.findFirst.mockResolvedValueOnce(mockAppt);

        await expect(service.clientCancel('appt-1', 'business-1')).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });
});
