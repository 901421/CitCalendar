import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding...');

  // Clean data
  await prisma.cajaDailyClose.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.professionalBlock.deleteMany();
  await prisma.professionalSchedule.deleteMany();
  await prisma.professionalService.deleteMany();
  await prisma.user.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.business.deleteMany();

  // Create Business
  const business = await prisma.business.create({
    data: {
      name: 'El Viejo Oficio',
      slug: 'el-viejo-oficio',
      logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=200&auto=format&fit=crop',
      address: 'Calle Mayor, 12, Madrid, España',
      phone: '+34 912 345 678',
      cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes de la cita. Después se retiene la seña.',
      depositPercent: 20.0,
      schedule: {
        monday: { open: '09:00', close: '20:00', isOpen: true },
        tuesday: { open: '09:00', close: '20:00', isOpen: true },
        wednesday: { open: '09:00', close: '20:00', isOpen: true },
        thursday: { open: '09:00', close: '20:00', isOpen: true },
        friday: { open: '09:00', close: '20:00', isOpen: true },
        saturday: { open: '09:00', close: '18:00', isOpen: true },
        sunday: { open: '00:00', close: '00:00', isOpen: false },
      },
      themeConfig: {
        primaryColor: '#C8902A',
        backgroundColor: '#131313',
        surfaceColor: '#1A1816',
      },
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('contraseña123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@elviejooficio.es',
      password: hashedPassword,
      name: 'Administrador Viejo Oficio',
      role: 'OWNER',
      businessId: business.id,
    },
  });

  // Create Services
  const servicesData = [
    { name: 'Corte Clásico', description: 'Corte tradicional a tijera o máquina', durationMinutes: 30, price: 18.00, category: 'Corte' },
    { name: 'Corte + Barba', description: 'Servicio completo de corte con arreglo de barba tradicional', durationMinutes: 45, price: 28.00, category: 'Combo' },
    { name: 'Fade Bajo', description: 'Degradado moderno comenzando bajo desde el cuello', durationMinutes: 30, price: 20.00, category: 'Corte' },
    { name: 'Degradado Máquina', description: 'Corte rápido con degradado utilizando máquina', durationMinutes: 30, price: 22.00, category: 'Corte' },
    { name: 'Afeitado Navaja', description: 'Ritual de afeitado con toalla caliente y navaja libre', durationMinutes: 30, price: 22.00, category: 'Barba' },
    { name: 'Arreglo Barba', description: 'Perfilado e hidratación de barba', durationMinutes: 15, price: 12.00, category: 'Barba' },
  ];

  const services = [];
  for (const s of servicesData) {
    const service = await prisma.service.create({
      data: {
        ...s,
        businessId: business.id,
      },
    });
    services.push(service);
  }

  // Create Professionals
  const professionalsData = [
    { name: 'Rafa', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop', bio: 'Especialista en degradados modernos y corte clásico.', rating: 4.90, commissionRate: 15.00, commissionType: 'PERCENT' },
    { name: 'Luis', photoUrl: 'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?q=80&w=150&auto=format&fit=crop', bio: 'Experto en ritual de afeitado a navaja y diseño de barbas.', rating: 4.80, commissionRate: 15.00, commissionType: 'PERCENT' },
    { name: 'Carlos', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop', bio: 'Barbero tradicional con enfoque en estilos clásicos y tijera.', rating: 4.70, commissionRate: 5.00, commissionType: 'FIXED' },
  ];

  const professionals = [];
  for (const p of professionalsData) {
    const prof = await prisma.professional.create({
      data: {
        ...p,
        businessId: business.id,
      },
    });
    professionals.push(prof);

    // Link professional to all services
    for (const service of services) {
      await prisma.professionalService.create({
        data: {
          professionalId: prof.id,
          serviceId: service.id,
        },
      });
    }

    // Create Schedules (Monday = 1 to Saturday = 6)
    for (let day = 1; day <= 6; day++) {
      await prisma.professionalSchedule.create({
        data: {
          professionalId: prof.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '20:00',
          isActive: true,
        },
      });
    }
  }

  // Create Clients
  const clientsData = [
    { name: 'Marco Villanueva', phone: '+34 612 345 678', email: 'marco.v@gmail.com', tags: ['VIP'] },
    { name: 'Diego Salmerón', phone: '+34 623 456 789', email: 'diego.s@hotmail.com', tags: [] },
    { name: 'Andrés Molina', phone: '+34 634 567 890', email: 'andres.m@yahoo.es', tags: ['INACTIVO'], notes: 'Segundo no-show este mes. Avisar antes de reservar.' },
    { name: 'Pablo Ruiz', phone: '+34 645 678 901', email: 'pablo.ruiz@outlook.com', tags: ['VIP'] },
    { name: 'Sergio Méndez', phone: '+34 656 789 012', email: 'sergio.m@gmail.com', tags: ['VIP'], notes: 'Siempre puntual.' },
    { name: 'Javier Torres', phone: '+34 667 890 123', email: 'javier.t@gmail.com', tags: [] },
    { name: 'Tomás Herrera', phone: '+34 678 901 234', email: 'tomas.h@yahoo.es', tags: ['INACTIVO'] },
  ];

  const clients = [];
  for (const c of clientsData) {
    const client = await prisma.client.create({
      data: {
        ...c,
        businessId: business.id,
      },
    });
    clients.push(client);
  }

  // Helper date generators for today
  const today = new Date();
  today.setSeconds(0);
  today.setMilliseconds(0);

  const getTodayAt = (hours: number, minutes: number = 0) => {
    const d = new Date(today);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const getTomorrowAt = (hours: number, minutes: number = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Create Appointments
  // 1. Marco Villanueva - Corte + Barba - Rafa - 09:00 - completed
  const appt1 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[0].id,
      professionalId: professionals[0].id, // Rafa
      status: 'COMPLETED',
      startTime: getTodayAt(9, 0),
      endTime: getTodayAt(9, 45),
      totalPrice: 28.00,
      paymentMethod: 'CARD',
      notes: 'Prefiere tijera en laterales, máquina 0 en nuca.',
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt1.id,
      serviceId: services[1].id, // Corte + Barba
      price: 28.00,
      durationMinutes: 45,
    },
  });

  // 2. Diego Salmerón - Corte Clásico - Luis - 10:00 - completed
  const appt2 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[1].id,
      professionalId: professionals[1].id, // Luis
      status: 'COMPLETED',
      startTime: getTodayAt(10, 0),
      endTime: getTodayAt(10, 30),
      totalPrice: 18.00,
      paymentMethod: 'CASH',
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt2.id,
      serviceId: services[0].id, // Corte Clásico
      price: 18.00,
      durationMinutes: 30,
    },
  });

  // 3. Andrés Molina - Afeitado Navaja - Rafa - 10:30 - no-show
  const appt3 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[2].id,
      professionalId: professionals[0].id, // Rafa
      status: 'NO_SHOW',
      startTime: getTodayAt(10, 30),
      endTime: getTodayAt(11, 0),
      totalPrice: 22.00,
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt3.id,
      serviceId: services[4].id, // Afeitado Navaja
      price: 22.00,
      durationMinutes: 30,
    },
  });

  // 4. Pablo Ruiz - Corte + Barba - Carlos - 11:30 - confirmed
  const appt4 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[3].id,
      professionalId: professionals[2].id, // Carlos
      status: 'CONFIRMED',
      startTime: getTodayAt(11, 30),
      endTime: getTodayAt(12, 15),
      totalPrice: 28.00,
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt4.id,
      serviceId: services[1].id, // Corte + Barba
      price: 28.00,
      durationMinutes: 45,
    },
  });

  // 5. Sergio Méndez - Fade Bajo - Luis - 12:30 - confirmed
  const appt5 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[4].id,
      professionalId: professionals[1].id, // Luis
      status: 'CONFIRMED',
      startTime: getTodayAt(12, 30),
      endTime: getTodayAt(13, 0),
      totalPrice: 20.00,
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt5.id,
      serviceId: services[2].id, // Fade Bajo
      price: 20.00,
      durationMinutes: 30,
    },
  });

  // 6. Javier Torres - Corte Clásico - Rafa - 13:00 - confirmed
  const appt6 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[5].id,
      professionalId: professionals[0].id, // Rafa
      status: 'CONFIRMED',
      startTime: getTodayAt(13, 0),
      endTime: getTodayAt(13, 30),
      totalPrice: 18.00,
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt6.id,
      serviceId: services[0].id, // Corte Clásico
      price: 18.00,
      durationMinutes: 30,
    },
  });

  // 7. Tomás Herrera - Corte + Barba - Carlos - Tomorrow 10:00 - confirmed
  const appt7 = await prisma.appointment.create({
    data: {
      businessId: business.id,
      clientId: clients[6].id,
      professionalId: professionals[2].id, // Carlos
      status: 'CONFIRMED',
      startTime: getTomorrowAt(10, 0),
      endTime: getTomorrowAt(10, 45),
      totalPrice: 28.00,
    },
  });
  await prisma.appointmentService.create({
    data: {
      appointmentId: appt7.id,
      serviceId: services[1].id,
      price: 28.00,
      durationMinutes: 45,
    },
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
