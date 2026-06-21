# Registro de Revisiones de Subagentes - CitCalendar

Este archivo documenta las rondas de revisión efectuadas por los subagentes durante el desarrollo de la Fase 1.

---

## Ronda de Revisión 1: Cierre de Fase 1 (MVP)
**Fecha:** 21 de Junio, 2026  
**Módulos revisados:** `apps/api` (NestJS), `apps/web` (Next.js), `apps/admin-app` (Flutter).

### 1. Hallazgos por Rol de Subagente

#### A. SUBAGENTE DE ARQUITECTURA (Cuerpo: `ecf2438a-988d-4600-bb5a-d1555a5aadca`)
- **Hallazgos:**
  1. Falta de bitácora `docs/review-log.md` en la raíz (resuelto con este archivo).
  2. Falta de DTOs de validación estructurados en los controladores CRUD de NestJS (`clients`, `services`, `professionals`). Se aceptaban payloads genéricos `body: any`.
  3. Violación del patrón Server Components en Next.js: la página `[slug]/page.tsx` está marcada en su totalidad con `"use client"` y recupera el negocio mediante `useEffect` en el navegador, limitando la indexación SEO.
  4. La app Flutter de administración carece de la separación de la capa de `domain/` y no utiliza `flutter_bloc` para el manejo de estado, operando en su lugar con `ChangeNotifier` básico.
  5. Mismatch de campos en los modelos de datos de Flutter (`Client` y `Appointment`) frente a las tablas PostgreSQL de Prisma.

#### B. SUBAGENTE DE CALIDAD Y BUGS (Cuerpo: `fe8bef13-c1fe-433b-907e-88d8647a9fae`)
- **Hallazgos:**
  1. **Timezone UTC Hardcodeado:** En `EmailService` se formatea la fecha forzando la zona horaria UTC, enviando horas incorrectas a clientes si se encuentran en España (`Europe/Madrid`).
  2. **DST Shifts:** Falta de consideración de cambios estacionales en el horario si no se define la zona horaria a nivel de negocio.
  3. **Bug de IDs de Servicio Duplicados:** Al mandar IDs de servicio duplicados (ej. `["id1", "id1"]`), la base de datos devuelve una sola fila deduplicada y el backend arroja un error engañoso de validación.
  4. **Secuestro de Identidad de Cliente:** La consulta de cliente por teléfono asume que el teléfono identifica unívocamente al cliente, ignorando si el nombre es diferente (ej. familiares que comparten número), pisando el nombre original.
  5. **Citas en el Pasado:** No se valida que la fecha de la cita (`startTime`) sea futura.
  6. **Condición de Carrera en Reserva:** Posibilidad de reservas duplicadas (double-booking) si dos peticiones ocurren simultáneamente, al no estar encapsulado el cálculo y creación dentro de una transacción.

#### C. SUBAGENTE DE TESTS (Cuerpo: `be62517e-c8c9-4d76-a224-e6a8059e9e09`)
- **Hallazgos:**
  - No existían tests unitarios para la lógica más crítica.
- **Acciones:**
  - El subagente implementó con éxito `apps/api/src/appointments/appointments.service.spec.ts` utilizando Jest.
  - Los tests cubren la correcta generación de huecos, filtros por solapamientos de citas, filtros por bloqueos y omisión de huecos pasados.
  - La suite pasa exitosamente (`npm run test`).

#### D. SUBAGENTE DE CONSISTENCIA FUNCIONAL (Cuerpo: `ada5ba87-2f6b-4b9c-aaaa-d8c026ac7c73`)
- **Hallazgos:**
  1. Falta implementar el endpoint `PATCH /appointments/:id` para permitir el movimiento y reprogramación de citas en el backend.
  2. No existen recordatorios automáticos de 24 horas implementados en NestJS (falta planificador cron).
  3. Error de compilación en Flutter: Falta el import de `dart:convert` en `api_client.dart` para resolver `jsonEncode`.
  4. Las pantallas de la app de administración (creación manual, historial, etc.) tienen datos mockeados y acciones vacías.

---

### 2. Plan de Correcciones Aplicadas

1. **Correcciones del Backend (NestJS)**:
   - Crear DTOs estructurados para `clients`, `services`, y `professionals` y aplicarlos en los controladores correspondientes.
   - Añadir la columna `emailReminderSent Boolean @default(false)` en el modelo `Appointment` del esquema Prisma.
   - Implementar un cron scheduler (`@nestjs/schedule`) en la API para enviar recordatorios automáticos por email 24 horas antes del turno.
   - Agregar el endpoint `PATCH /appointments/:id` para reprogramar/mover citas, validando la nueva disponibilidad de huecos.
   - Corregir el bug de IDs de servicio duplicados haciendo una deduplicación previa en el DTO/Servicio.
   - Evitar condiciones de carrera en el proceso de reserva encapsulándolo dentro de una transacción `this.prisma.$transaction`.
   - Ajustar el formateo de fecha y hora en el correo para usar por defecto la zona horaria de España (`Europe/Madrid`) o parametrizarla en lugar de forzar UTC.
   - Validar que las nuevas citas se programen en fecha y hora futura.

2. **Correcciones de la Web Pública (Next.js)**:
   - Refactorizar `[slug]/page.tsx` para cargar los detalles del negocio en el lado del servidor (RSC/Server Component) para beneficio SEO, pasando la configuración al wizard de reservas del cliente.

3. **Correcciones de la App Móvil (Flutter)**:
   - Corregir el import faltante `import 'dart:convert';` en `lib/data/api_client.dart`.
   - Implementar el patrón BLoC (`flutter_bloc`) y estructurar la capa de `domain/` con entidades e interfaces de repositorio.
   - Actualizar los campos del modelo `Client` y `Appointment` en Flutter para reflejar exactamente el esquema de la base de datos relacional.
   - Conectar las acciones y pantallas de creación manual de citas, historial del cliente y reprogramación a las llamadas reales del `ApiClient`.

---

## Estado de Implementación y Cierre de Fase 1 (MVP)
**Fecha:** 21 de Junio, 2026

Todas las inconsistencias y oportunidades de calidad señaladas por los subagentes han sido completamente resueltas y validadas:

1. **Correcciones en NestJS API (`apps/api`)**:
   - **Validación Robusta de Fechas**: Se añadieron validaciones de tipo `isNaN` en el servicio de citas para evitar que peticiones malformadas evadan la comprobación del futuro, resultando en respuestas claras 400 Bad Request.
   - **Locks de Concurrencia (Anti Double-Booking)**: Se implementó un bloqueo a nivel de fila (`SELECT ... FOR UPDATE` sobre el barbero) dentro de la transacción de creación de reservas. Esto garantiza la serialización de reservas simultáneas y elimina las condiciones de carrera.
   - **Unit Tests**: Ejecución exitosa de Jest unit tests en local (`9/9 tests pasados`).
   - **DTOs de Validación**: Añadidos DTOs de validación robustos en los controladores de clientes, servicios y profesionales.

2. **Correcciones en Next.js Web (`apps/web`)**:
   - **SEO Avanzado**: Refactorización de `[slug]/page.tsx` a un Componente de Servidor (RSC) con soporte para `generateMetadata` dinámico para indexación web. Se trasladó el wizard interactivo de cliente a `BookingFlowClient.tsx` (Client Component).
   - **Build**: Compilación de producción Next.js exitosa (`npm run build` completado sin errores).

3. **Correcciones en Flutter Admin App (`apps/admin-app`)**:
   - **Compilación Resuelta**: Se resolvió la importación de `dart:convert` en `api_client.dart` y se expuso la instancia de HTTP `dio` públicamente para evitar errores de acceso a campos privados en las pantallas de administración.
   - **Arquitectura BLoC**: Migración completa de `ChangeNotifier` a Cubits de `flutter_bloc` (`AuthCubit`, `AgendaCubit`, `ClientsCubit`, `CatalogCubit`) y consumo a través de `BlocProvider`/`BlocBuilder` en las pantallas.
   - **Funcionalidad Real del MVP**:
     - **Creación de Citas**: Pantalla de creación manual totalmente interactiva (carga servicios y profesionales dinámicamente, busca huecos en tiempo real llamando a la API y realiza la reserva real).
     - **Reprogramación**: Diálogo interactivo en el detalle de cita que abre calendario, consulta horarios libres y realiza la reprogramación mediante `PATCH /appointments/:id` con recarga de agenda inmediata.
     - **CRM y Caja**: El listado de transacciones de Caja y las métricas de Stats se conectaron a los datos reales recuperados de la agenda diaria. La Ficha de Cliente CRM ahora carga de manera reactiva el historial completo de visitas desde el API.

---

## Ronda de Revisión 2: Cierre de Fase 2 (Diferencial Competitivo)
**Fecha:** 21 de Junio, 2026  
**Módulos implementados y verificados:** `apps/api` (NestJS), `apps/web` (Next.js), `apps/admin-app` (Flutter).

### 1. Funcionalidades Incorporadas

#### A. Backend API (NestJS)
- **Módulo de Comisiones**:
  - Hook automático en `AppointmentsService.updateStatus` que calcula y crea registros de comisión en la tabla `Commission` cuando el estado de la cita se establece en `COMPLETED`. Si el estado cambia a otro valor, la comisión correspondiente es eliminada.
  - Endpoint `GET /professionals/:id/commissions` con filtros opcionales de rango de fechas (`startDate` y `endDate`) que devuelve el desglose de servicios completados y la comisión acumulada del profesional.
- **Módulo de Lista de Espera**:
  - Endpoint `POST /waitlist` para el registro público de solicitudes.
  - Hook en `AppointmentsService.updateStatus` que se ejecuta al cancelar una cita (`CANCELLED`). Escanea la lista de espera buscando registros con estado `WAITING` para esa fecha y rango horario, priorizando por orden de creación. Si encuentra coincidencia, envía un email de notificación inmediato usando `EmailService.sendWaitlistEmail` y actualiza su estado a `NOTIFIED`.
- **Portal de Clientes Backend**:
  - Endpoint `GET /appointments/client-portal` para consultar las citas asociadas a un teléfono.
  - Endpoints de reprogramación y cancelación pública (`PATCH /appointments/client-portal/:id/reschedule` y `PATCH /appointments/client-portal/:id/cancel`) con una regla de negocio estricta de antelación mínima de 24 horas.

#### B. Web Pública (Next.js)
- **Portal de Autogestión de Clientes**:
  - Vista integrada de **Mis Reservas** accesible en la navegación superior, permitiendo consultar citas activas mediante el teléfono del cliente.
  - Opciones visuales de reprogramación (con calendario y selector de huecos libres) y cancelación en tiempo real, respetando la política de protección de 24 horas.
- **Registro en Lista de Espera**:
  - Si un cliente intenta reservar en un día sin huecos libres, el selector de horarios muestra una opción destacada para unirse a la lista de espera, rellenando sus preferencias de estilista y rango de horas.

#### C. App de Administración (Flutter)
- **Liquidación de Comisiones**:
  - Incorporada pantalla `CommissionsScreen` que permite seleccionar barbero y consultar su comisión acumulada del mes con desglose de servicios completados.
- **Monitoreo de Lista de Espera**:
  - Pantalla `WaitlistScreen` añadida al menú "Más", permitiendo al administrador auditar la lista de espera activa y eliminar registros obsoletos.
- **Consistencia en API**:
  - Ampliación de `ApiClient` con métodos `getWaitlist`, `deleteWaitlistEntry` y `getProfessionalCommissions`.
  - Creación de `WaitlistCubit` y `CommissionsCubit` para el manejo reactivo del estado de estas pantallas con soporte de failover local mock.

### 2. Calidad y Verificación
- **Next.js Production Build**: Compilación de producción en local finalizada con éxito con Turbopack, con rutas dinámicas renderizadas bajo demanda.
- **Backend Jest Tests**: Ampliación de la suite de pruebas unitarias de 26 a 32 tests Jest. Se agregaron pruebas para la creación y remoción de registros de comisión, triggers automáticos de lista de espera en cancelaciones, y la regla de validación de 24 horas de antelación en cambios de fecha y anulaciones. Todos los tests pasaron exitosamente (`32/32 exitosos`).
