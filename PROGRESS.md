# Estado del Proyecto - SaaS Reservas de Belleza (CitCalendar)

Este archivo documenta el progreso de la implementación del SaaS paso a paso.

---

## Estado Actual: Fase 2 (Diferencial Competitivo) Completada al 100% y Verificada

Hemos finalizado y validado funcional y técnicamente el núcleo de la aplicación (Fase 1) y los diferenciales competitivos (Fase 2). El sistema se compone de una API NestJS robusta, un flujo de reserva web Next.js enfocado en velocidad/SEO con portal de autogestión de citas y lista de espera, y un panel de administración en Flutter bajo patrón BLoC con liquidación de comisiones, monitorización de lista de espera y gestión de caja.

### Qué se ha construido hasta ahora:

1. **Backend API (`apps/api`)**:
   - Modelo relacional en PostgreSQL vía Prisma ORM (Business, User, Service, Professional, Client, Appointment, Commission, Waitlist, CajaDailyClose).
   - Core de cálculo de disponibilidad de huecos de 15 minutos en tiempo real sin solapamientos.
   - Transacción atómica en la creación de reservas con protección anti double-booking mediante **row-level locking (FOR UPDATE)** sobre el profesional.
   - Recordatorio automático de 24 horas vía planificador de tareas integrado (`@nestjs/schedule`).
   - Envío de confirmaciones inmediatas por email con Nodemailer formateado en la zona horaria del negocio (`Europe/Madrid`).
   - Controladores CRUD de administración protegidos con JWT y sanitización DTO de payloads (`class-validator`).
   - **Módulo de comisiones**: liquidación automática al completar citas.
   - **Módulo de lista de espera**: emparejamiento inteligente y notificación por email al cancelar un turno.
   - **Portal de Clientes**: endpoints públicos para autogestión de citas con política estricta de 24h.
   - Suite de pruebas unitarias Jest con 32 tests de éxito (100%).

2. **Web Pública de Clientes (`apps/web`)**:
   - Página del negocio y wizard interactivo de reservas paso a paso (Servicio -> Profesional -> Fecha/Hora -> Datos de Contacto -> Confirmación).
   - **Portal de Autogestión**: Búsqueda por teléfono, reprogramación (con calendario interactivo y consulta de disponibilidad) y cancelación en tiempo real.
   - **Lista de Espera**: Formulario de registro de lista de espera si no hay huecos en el día.
   - Arquitectura Next.js App Router con Server Components (RSC) para SEO y Client Components para interactividad, compilando exitosamente a producción.

3. **App Android de Administración (`apps/admin-app`)**:
   - Login real conectado a la API de autenticación con persistencia de token JWT.
   - Vista de agenda diaria con métricas de reservas del día en tiempo real.
   - Ficha del cliente (CRM) con historial dinámico de reservas previas.
   - Creación manual y reprogramación de citas integrada con la API.
   - **Módulo de Comisiones**: Pantalla de liquidación acumulada y desglose por profesional.
   - **Módulo de Lista de Espera**: Pantalla de monitoreo y eliminación de solicitudes activas.
   - Manejo de estado robusto con `flutter_bloc` (Cubits).

---

## Cómo probarlo en local:

### Requisitos previos:
- Node.js v18+ y npm instalados.
- Base de datos PostgreSQL activa.
- Flutter SDK instalado.

### Paso 1: Configurar la Base de Datos y la API
1. Entra a `apps/api`.
2. Copia `.env.example` a `.env` y configura tu `DATABASE_URL` (PostgreSQL local o Supabase) junto a las claves de Email para recordatorios.
3. Ejecuta las migraciones y la semilla de datos iniciales:
   ```bash
   npm install
   npx prisma db push
   npx prisma db seed
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```
   La API correrá por defecto en `http://localhost:3001`.

### Paso 2: Iniciar la Web de Clientes
1. Entra a `apps/web`.
2. Instala dependencias e inicia el servidor Next.js:
   ```bash
   npm install
   npm run dev
   ```
3. Visita la página del negocio en `http://localhost:3000/el-viejo-oficio` para probar el flujo de reservas público.

### Paso 3: Iniciar la App Móvil
1. Entra a `apps/admin-app`.
2. Asegúrate de que el emulador Android o tu dispositivo físico esté conectado.
3. Inicia la app:
   ```bash
   flutter pub get
   flutter run
   ```
   *Nota:* Si utilizas el emulador de Android oficial, las llamadas se redirigirán automáticamente a `http://10.0.2.2:3001` (localhost de la máquina host).

---

## Instrucciones de Despliegue en Producción

### 1. Base de Datos (Supabase)
1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Copia la cadena de conexión de la base de datos PostgreSQL (Transaction o Session mode) y guárdala para la variable `DATABASE_URL`.

### 2. Backend API (Render o Railway)
#### En Render:
1. Crea un nuevo **Web Service** conectado a tu repositorio de GitHub.
2. Configura los siguientes parámetros:
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `node dist/main.js`
3. Agrega las variables de entorno en la sección *Environment*:
   - `DATABASE_URL`: Tu cadena de conexión de Supabase.
   - `JWT_SECRET`: Una firma aleatoria y segura.
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: Credenciales SMTP para enviar recordatorios y confirmaciones.
   - `PORT`: `3001` (Render asignará uno automáticamente, pero es buena práctica forzarlo o dejar que lo detecte).

### 3. Web Pública de Reservas (Vercel)
1. Crea un nuevo proyecto en [Vercel](https://vercel.com/) conectado a tu repositorio.
2. Configura los siguientes parámetros:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
3. Agrega la variable de entorno:
   - `NEXT_PUBLIC_API_URL`: URL completa de tu API NestJS desplegada en Render (ej. `https://citcalendar-api.onrender.com`).
4. Haz clic en **Deploy**. Vercel construirá la web y te dará una URL amigable (ej. `https://tu-proyecto.vercel.app/el-viejo-oficio`).
