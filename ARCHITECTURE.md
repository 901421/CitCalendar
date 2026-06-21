# Arquitectura del Sistema - SaaS Reservas de Belleza (CitCalendar)

Este documento detalla las decisiones de arquitectura, el diseño de la base de datos, la estructura del monorepo y los patrones de desarrollo para el proyecto de reservas.

---

## 1. Estructura del Monorepo

Para facilitar la consistencia en el desarrollo y compartir tipados/configuraciones, se define una estructura de monorepo basada en directorios estándar:

```
CitCalendar/
├── apps/
│   ├── api/                   # Backend NestJS (TypeScript)
│   ├── web/                   # Web pública de clientes Next.js + Tailwind (Stitch design)
│   │   └── design-reference/  # Stitch original (HTML/Tailwind)
│   └── admin-app/             # App móvil del administrador (Flutter)
│       └── design-reference/  # Stitch original (React/Tailwind)
├── packages/                  # Paquetes compartidos (opcional)
├── docs/
│   └── review-log.md          # Bitácora de revisiones de subagentes (Paso 3)
├── ARCHITECTURE.md            # Este archivo
├── PROGRESS.md                # Bitácora de progreso (Paso 4)
└── README.md
```

---

## 2. Modelo de Base de Datos (PostgreSQL en Supabase)

Usaremos **Prisma ORM** en el backend para gestionar las migraciones y el tipado. A continuación se define el esquema relacional con sus campos principales, relaciones e índices.

### Diagrama de Relaciones / Tablas

#### 1. Negocio (`Business`)
Representa a la barbería o salón.
- `id` (UUID, PK)
- `name` (VARCHAR, Not Null)
- `slug` (VARCHAR, Unique, Not Null) - Usado para la URL pública (ej. `/el-viejo-oficio`)
- `logo_url` (VARCHAR)
- `address` (TEXT)
- `phone` (VARCHAR)
- `cancellation_policy` (TEXT)
- `deposit_percent` (DECIMAL, default 0) - Porcentaje de seña requerido (Fase 2)
- `stripe_account_id` (VARCHAR) - Para pagos directos (Fase 2)
- `schedule` (JSONB) - Horario general de apertura (ej. `{"monday": {"open": "09:00", "close": "20:00"}, ...}`)
- `theme_config` (JSONB) - Colores, fuentes y personalización visual (Stitch theme)
- `created_at` (TIMESTAMP)

#### 2. Servicios (`Service`)
- `id` (UUID, PK)
- `business_id` (UUID, FK -> `Business.id`)
- `name` (VARCHAR)
- `description` (TEXT)
- `duration_minutes` (INTEGER) - Duración del servicio
- `price` (DECIMAL)
- `category` (VARCHAR) - Categoría (Corte, Barba, Manicura, etc.)
- `status` (VARCHAR) - `ACTIVE`, `INACTIVE`
- `created_at` (TIMESTAMP)

*Índices:*
- `idx_service_business`: `(business_id)`
- `idx_service_status`: `(status)`

#### 3. Profesionales (`Professional`)
Estilistas, barberos, etc.
- `id` (UUID, PK)
- `business_id` (UUID, FK -> `Business.id`)
- `name` (VARCHAR)
- `photo_url` (VARCHAR)
- `bio` (TEXT)
- `rating` (DECIMAL, default 5.0)
- `commission_rate` (DECIMAL) - Porcentaje o fijo de comisión (Fase 2)
- `commission_type` (VARCHAR) - `PERCENT`, `FIXED` (Fase 2)
- `status` (VARCHAR) - `ACTIVE`, `INACTIVE`
- `created_at` (TIMESTAMP)

*Índices:*
- `idx_professional_business`: `(business_id)`

#### 4. Servicios por Profesional (`ProfessionalService`)
Tabla intermedia de muchos-a-muchos.
- `professional_id` (UUID, PK, FK -> `Professional.id`)
- `service_id` (UUID, PK, FK -> `Service.id`)

#### 5. Horarios de Profesional (`ProfessionalSchedule`)
Horario y excepciones de disponibilidad semanal por profesional.
- `id` (UUID, PK)
- `professional_id` (UUID, FK -> `Professional.id`)
- `day_of_week` (INTEGER) - 0 (Domingo) a 6 (Sábado)
- `start_time` (VARCHAR, ej. "09:00")
- `end_time` (VARCHAR, ej. "14:00")
- `is_active` (BOOLEAN, default true)

#### 6. Bloqueos de Agenda (`ProfessionalBlock`)
Vacaciones, descansos, formación, etc.
- `id` (UUID, PK)
- `professional_id` (UUID, FK -> `Professional.id`)
- `start_time` (TIMESTAMP) - Inicio del bloqueo (fecha y hora)
- `end_time` (TIMESTAMP) - Fin del bloqueo
- `reason` (VARCHAR)

*Índices:*
- `idx_block_professional_range`: `(professional_id, start_time, end_time)`

#### 7. Clientes (`Client`)
- `id` (UUID, PK)
- `business_id` (UUID, FK -> `Business.id`)
- `name` (VARCHAR)
- `email` (VARCHAR, Nullable)
- `phone` (VARCHAR)
- `notes` (TEXT) - Notas internas (alergias, etc.)
- `tags` (TEXT[]) - VIP, Nuevo, Inactivo, etc.
- `created_at` (TIMESTAMP)

*Índices:*
- `idx_client_business_phone`: `(business_id, phone)`

#### 8. Citas (`Appointment`)
- `id` (UUID, PK)
- `business_id` (UUID, FK -> `Business.id`)
- `client_id` (UUID, FK -> `Client.id`)
- `professional_id` (UUID, FK -> `Professional.id`)
- `status` (VARCHAR) - `PENDING`, `CONFIRMED`, `COMPLETED`, `NO_SHOW`, `CANCELLED`
- `start_time` (TIMESTAMP)
- `end_time` (TIMESTAMP)
- `notes` (TEXT)
- `total_price` (DECIMAL)
- `deposit_paid` (DECIMAL, default 0.0)
- `stripe_payment_id` (VARCHAR, Nullable)
- `payment_method` (VARCHAR, Nullable) - `CASH`, `CARD`, `BIZUM`, `STRIPE_ONLINE`
- `created_at` (TIMESTAMP)

*Índices:*
- `idx_appt_professional_range`: `(professional_id, start_time, end_time)`
- `idx_appt_business_date`: `(business_id, start_time)`

#### 9. Servicios de una Cita (`AppointmentService`)
Soporte para citas con servicios combinados (múltiples servicios en una cita).
- `id` (UUID, PK)
- `appointment_id` (UUID, FK -> `Appointment.id`)
- `service_id` (UUID, FK -> `Service.id`)
- `price` (DECIMAL)
- `duration_minutes` (INTEGER)

#### 10. Lista de Espera (`Waitlist`) (Fase 2)
- `id` (UUID, PK)
- `business_id` (UUID, FK -> `Business.id`)
- `client_id` (UUID, FK -> `Client.id`)
- `requested_date` (DATE)
- `preferred_start` (TIME)
- `preferred_end` (TIME)
- `professional_id` (UUID, FK, Nullable)
- `status` (VARCHAR) - `WAITING`, `NOTIFIED`, `BOOKED`, `EXPIRED`
- `created_at` (TIMESTAMP)

---

## 3. Algoritmo de Cálculo de Disponibilidad (Core)

El cálculo de huecos libres para un día determinado ($D$) y un servicio ($S$) con duración $L$ minutos, consta de los siguientes pasos:

1. **Obtener el Horario Comercial del Negocio:** Verificar si el día de la semana de $D$ está abierto y en qué rango de horas ($H_{inicio}$, $H_{fin}$).
2. **Obtener Profesionales Habilitados:** Filtrar profesionales del negocio que realicen el servicio $S$. Si el cliente solicita un profesional específico ($P$), filtrar solo a ese.
3. **Para cada profesional ($P_i$):**
   a. **Cargar Horario Semanal:** Obtener la disponibilidad de $P_i$ para el día de la semana de $D$ (ej. de 09:00 a 14:00 y de 16:00 a 20:00).
   b. **Cargar Citas del Día:** Buscar todas las citas activas (`status` $\neq$ `CANCELLED` y `status` $\neq$ `NO_SHOW`) de $P_i$ en la fecha $D$.
   c. **Cargar Bloqueos del Día:** Buscar bloqueos temporales de $P_i$ en la fecha $D$.
   d. **Generar Intervalos Ocupados ($O$):** Fusionar citas y bloqueos en una sola lista de intervalos excluyentes $[T_{inicio}, T_{fin}]$.
   e. **Calcular Huecos Disponibles:**
      - Dividir el horario laboral del profesional en intervalos de tiempo (ej. intervalos de 15 o 30 minutos).
      - Para cada hora tentativa $H$:
        - Si $H + L \leq T_{fin\_laboral}$ del profesional.
        - Verificar que el intervalo $[H, H+L]$ no se solape con ningún intervalo ocupado en $O$.
        - Verificar que el intervalo esté dentro de uno de los bloques de horario laboral del profesional.
        - Si pasa todas las condiciones, $H$ es un hueco disponible para $P_i$.
4. **Agrupación:** Si se seleccionó "Cualquiera disponible", los huecos disponibles se unifican (un hueco está libre si al menos un profesional lo tiene libre). Si se seleccionó uno específico, se devuelven solo sus huecos.

---

## 4. Patrones de Diseño e Implementación Técnica

### Backend (NestJS)
- **Patrón Modular:** Cada entidad (`Business`, `Services`, `Professionals`, `Appointments`, `Clients`) tendrá su propio módulo con controller, service y entity.
- **Inyección de Dependencias:** Gestión limpia de dependencias vía constructor.
- **Validación de Datos:** Uso de `class-validator` y `class-transformer` para sanitizar payloads en los DTOs.
- **Manejo de Errores global:** Filtro de excepciones HTTP para formatear respuestas de error uniformes.
- **Seguridad:** CORS habilitado, políticas de contraseñas seguras mediante hashing con `bcrypt`, autenticación JWT para el panel de administración.

### Web de Clientes (Next.js App Router + Tailwind)
- **Componentes de Servidor (RSC) y Cliente:** Páginas cargadas en el servidor para SEO y carga veloz, con interacciones (calendario, selects) en componentes de cliente (`'use client'`).
- **Tailwind CSS:** Diseño responsivo móvil-primero utilizando el sistema de colores de Stitch (`#131313`, `#f2ca50`, etc.).
- **Gestión de Estado Local:** Context API para el flujo de reserva (Servicio -> Profesional -> Fecha/Hora -> Datos de Confirmación).

### App de Administración (Flutter)
- **Arquitectura de Capas (Clean Architecture):**
  - `data/`: Modelos, datasources (HTTP/Dio, LocalStorage/SharedPrefs), repositorios (implementación).
  - `domain/`: Entidades, interfaces de repositorio, casos de uso.
  - `presentation/`: Bloc/Cubit para manejo de estado, pantallas (widgets).
- **Manejo de Estado:** `flutter_bloc` para separar la lógica de negocio de la interfaz gráfica.
- **Cliente HTTP:** `dio` configurado con interceptores para inyección de token JWT, refresh de token, y manejo de errores centralizado.
