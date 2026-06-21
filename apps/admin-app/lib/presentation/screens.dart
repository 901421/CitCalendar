import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models.dart';
import '../data/api_client.dart';
import 'controllers.dart';

// Palette Colors matching Stitch specifications
class AppTheme {
  static const Color background = Color(0xff0e0d0c);
  static const Color surface = Color(0xff1a1816);
  static const Color surfaceLowest = Color(0xff0a0908);
  static const Color primary = Color(0xffc8902a);
  static const Color primaryLight = Color(0xffe5a93c);
  static const Color textMain = Color(0xffe5e2e1);
  static const Color textMuted = Color(0xff6a6460);
  static const Color textMutedDark = Color(0xff4a4440);
  
  static const Color statusPending = Color(0xffc8902a);
  static const Color statusCompleted = Color(0xff34d399);
  static const Color statusNoShow = Color(0xfff87171);
  
  static BoxDecoration cardDecoration = BoxDecoration(
    color: surface,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.white.withOpacity(0.06), width: 1),
  );

  static TextStyle titleStyle = GoogleFonts.barlowCondensed(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: textMain,
    letterSpacing: 1,
  );
  
  static TextStyle labelStyle = GoogleFonts.barlowCondensed(
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: textMuted,
    letterSpacing: 1.5,
  );
}

// ── LOGIN SCREEN ─────────────────────────────────────────────────────────────

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'admin@elviejooficio.es');
  final _passwordController = TextEditingController(text: 'contraseña123');
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: BlocBuilder<AuthCubit, AuthState>(
          builder: (context, state) {
            return Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 36.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Scissors Logo Badge
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xff1c1a16), Color(0xff252015)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppTheme.primary.withOpacity(0.3), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withOpacity(0.12),
                            blurRadius: 32,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.content_cut,
                        size: 40,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Titles
                    Text(
                      'BARBERÍA',
                      style: GoogleFonts.barlowCondensed(
                        fontSize: 10,
                        letterSpacing: 3,
                        color: const Color(0xff7a6030),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'EL VIEJO OFICIO',
                      style: GoogleFonts.barlowCondensed(
                        fontSize: 28,
                        letterSpacing: 2,
                        color: AppTheme.textMain,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'PANEL DE ADMINISTRACIÓN',
                      style: GoogleFonts.barlowCondensed(
                        fontSize: 10,
                        letterSpacing: 1.5,
                        color: Colors.grey[700],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    
                    const SizedBox(height: 36),
                    // Fields Divider
                    Row(
                      children: [
                        Expanded(child: Divider(color: Colors.white.withOpacity(0.06))),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12.0),
                          child: Text(
                            'ACCESO',
                            style: GoogleFonts.barlowCondensed(
                              fontSize: 9,
                              letterSpacing: 2,
                              color: Colors.grey[600],
                            ),
                          ),
                        ),
                        Expanded(child: Divider(color: Colors.white.withOpacity(0.06))),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Email Field
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('EMAIL', style: AppTheme.labelStyle),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _emailController,
                          style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textMain),
                          decoration: InputDecoration(
                            fillColor: AppTheme.surface,
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: AppTheme.primary),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Password Field
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('CONTRASEÑA', style: AppTheme.labelStyle),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textMain),
                          decoration: InputDecoration(
                            fillColor: AppTheme.surface,
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                color: AppTheme.textMuted,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: AppTheme.primary),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    if (state.errorMessage != null) ...[
                      Text(
                        state.errorMessage!,
                        style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 13),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Signin CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: state.isLoading
                            ? null
                            : () {
                                context.read<AuthCubit>().login(
                                  _emailController.text,
                                  _passwordController.text,
                                );
                              },
                        child: state.isLoading
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(color: AppTheme.background, strokeWidth: 2),
                              )
                            : Text(
                                'ENTRAR',
                                style: GoogleFonts.barlowCondensed(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.5,
                                  color: AppTheme.background,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    Text(
                      '¿Olvidaste tu contraseña?',
                      style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ── MAIN DASHBOARD COORDINATOR ───────────────────────────────────────────────

class MainDashboard extends StatefulWidget {
  const MainDashboard({Key? key}) : super(key: key);

  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  int _currentIndex = 0;
  
  late final AgendaCubit _agendaCubit;
  late final ClientsCubit _clientsCubit;
  late final CatalogCubit _catalogCubit;

  @override
  void initState() {
    super.initState();
    _agendaCubit = AgendaCubit()..fetchAppointments();
    _clientsCubit = ClientsCubit()..fetchClients();
    _catalogCubit = CatalogCubit()..fetchCatalog();
  }

  @override
  void dispose() {
    _agendaCubit.close();
    _clientsCubit.close();
    _catalogCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      const AgendaScreen(),
      const ClientsScreen(),
      const CajaScreen(),
      const StatsScreen(),
      _buildMoreMenu(),
    ];

    return MultiBlocProvider(
      providers: [
        BlocProvider<AgendaCubit>.value(value: _agendaCubit),
        BlocProvider<ClientsCubit>.value(value: _clientsCubit),
        BlocProvider<CatalogCubit>.value(value: _catalogCubit),
      ],
      child: Scaffold(
        backgroundColor: AppTheme.background,
        body: screens[_currentIndex],
        bottomNavigationBar: Container(
          decoration: const BoxDecoration(
            color: AppTheme.surfaceLowest,
            border: Border(top: BorderSide(color: Colors.white24, width: 0.2)),
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            backgroundColor: AppTheme.surfaceLowest,
            selectedItemColor: AppTheme.primary,
            unselectedItemColor: AppTheme.textMuted,
            type: BottomNavigationBarType.fixed,
            selectedLabelStyle: GoogleFonts.barlowCondensed(fontSize: 10, fontWeight: FontWeight.bold),
            unselectedLabelStyle: GoogleFonts.barlowCondensed(fontSize: 10),
            onTap: (index) {
              setState(() => _currentIndex = index);
            },
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Agenda'),
              BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Clientes'),
              BottomNavigationBarItem(icon: Icon(Icons.monetization_on), label: 'Caja'),
              BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'Stats'),
              BottomNavigationBarItem(icon: Icon(Icons.more_horiz), label: 'Más'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMoreMenu() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('MÁS AJUSTES', style: AppTheme.titleStyle),
            const SizedBox(height: 24),
            ListTile(
              leading: const Icon(Icons.list_alt, color: AppTheme.primary),
              title: Text('Lista de espera', style: GoogleFonts.inter(color: Colors.white)),
              trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const WaitlistScreen()),
                );
              },
            ),
            const Divider(color: Colors.white10, height: 1),
            ListTile(
              leading: const Icon(Icons.monetization_on_outlined, color: AppTheme.primary),
              title: Text('Comisiones y liquidación', style: GoogleFonts.inter(color: Colors.white)),
              trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const CommissionsScreen()),
                );
              },
            ),
            const Divider(color: Colors.white10, height: 1),
            const SizedBox(height: 12),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: Text('Cerrar sesión', style: GoogleFonts.inter(color: Colors.redAccent)),
              onTap: () {
                context.read<AuthCubit>().logout();
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ── TAB: AGENDA VIEW ─────────────────────────────────────────────────────────

class AgendaScreen extends StatelessWidget {
  const AgendaScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: BlocBuilder<AgendaCubit, AgendaState>(
          builder: (context, state) {
            return Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Agenda', style: AppTheme.titleStyle),
                          Text(
                            DateFormat('EEEE, d de MMMM', 'es_ES').format(state.selectedDate),
                            style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                      // Filter toggle
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xff141210),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white.withOpacity(0.07)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppTheme.primary,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Día',
                                style: GoogleFonts.barlowCondensed(
                                    color: AppTheme.background, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 12.0),
                              child: Text(
                                'Semana',
                                style: GoogleFonts.barlowCondensed(color: AppTheme.textMuted, fontSize: 11),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Simple calendar strip (next 7 days)
                Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: 7,
                    itemBuilder: (context, index) {
                      final day = today.add(Duration(days: index - 2)); // Show range
                      final isSelected = day.day == state.selectedDate.day &&
                          day.month == state.selectedDate.month;
                      final dayLabel = DateFormat('E', 'es_ES').format(day).substring(0, 1).toUpperCase();

                      return GestureDetector(
                        onTap: () => context.read<AgendaCubit>().selectDate(day),
                        child: Container(
                          width: 48,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: isSelected ? AppTheme.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                dayLabel,
                                style: GoogleFonts.barlowCondensed(
                                  fontSize: 10,
                                  color: isSelected ? AppTheme.background : AppTheme.textMuted,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                day.day.toString(),
                                style: GoogleFonts.barlowCondensed(
                                  fontSize: 16,
                                  color: isSelected ? AppTheme.background : AppTheme.textMain,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),

                // Quick metrics strip
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    children: [
                      _metricPill(state.confirmedCount, 'Pendientes', AppTheme.statusPending),
                      const SizedBox(width: 8),
                      _metricPill(state.completedCount, 'Hechas', AppTheme.statusCompleted),
                      const SizedBox(width: 8),
                      _metricPill(state.noShowCount, 'No-show', AppTheme.statusNoShow),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Appointment List
                Expanded(
                  child: state.isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                      : state.appointments.isEmpty
                          ? Center(
                              child: Text(
                                'No hay citas para este día.',
                                style: GoogleFonts.inter(color: AppTheme.textMuted),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: state.appointments.length,
                              itemBuilder: (context, index) {
                                final appt = state.appointments[index];
                                final timeStr = "${appt.startTime.hour.toString().padLeft(2, '0')}:${appt.startTime.minute.toString().padLeft(2, '0')}";
                                
                                Color statusColor = AppTheme.statusPending;
                                String statusLabel = 'CONFIRMADA';
                                if (appt.status.toLowerCase() == 'completed') {
                                  statusColor = AppTheme.statusCompleted;
                                  statusLabel = 'COMPLETADA';
                                } else if (appt.status.toLowerCase() == 'no-show') {
                                  statusColor = AppTheme.statusNoShow;
                                  statusLabel = 'NO-SHOW';
                                } else if (appt.status.toLowerCase() == 'cancelled') {
                                  statusColor = Colors.grey;
                                  statusLabel = 'CANCELADA';
                                }

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 10.0),
                                  child: InkWell(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (routeContext) => MultiBlocProvider(
                                            providers: [
                                              BlocProvider.value(value: context.read<AgendaCubit>()),
                                              BlocProvider.value(value: context.read<AuthCubit>()),
                                            ],
                                            child: AppointmentDetailScreen(appointment: appt),
                                          ),
                                        ),
                                      );
                                    },
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: statusColor.withOpacity(0.07),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: statusColor.withOpacity(0.2), width: 1),
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 4,
                                            height: 80,
                                            decoration: BoxDecoration(
                                              color: statusColor,
                                              borderRadius: const BorderRadius.only(
                                                topLeft: Radius.circular(12),
                                                bottomLeft: Radius.circular(12),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Text(
                                            timeStr,
                                            style: GoogleFonts.barlowCondensed(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: AppTheme.primary,
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  appt.client.name,
                                                  style: GoogleFonts.inter(
                                                      fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  appt.services.map((s) => s.name).join(', '),
                                                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400]),
                                                ),
                                                Text(
                                                  '↳ ${appt.professional.name}',
                                                  style: GoogleFonts.inter(fontSize: 10, color: AppTheme.textMuted),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.only(right: 16.0),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  '${appt.totalPrice.toInt()}€',
                                                  style: GoogleFonts.barlowCondensed(
                                                      fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                                ),
                                                const SizedBox(height: 4),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: Colors.black.withOpacity(0.4),
                                                    borderRadius: BorderRadius.circular(12),
                                                  ),
                                                  child: Text(
                                                    statusLabel,
                                                    style: GoogleFonts.barlowCondensed(
                                                      fontSize: 8,
                                                      fontWeight: FontWeight.bold,
                                                      color: statusColor,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                ),
              ],
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (routeContext) => MultiBlocProvider(
                providers: [
                  BlocProvider.value(value: context.read<AgendaCubit>()),
                  BlocProvider.value(value: context.read<CatalogCubit>()),
                  BlocProvider.value(value: context.read<ClientsCubit>()),
                  BlocProvider.value(value: context.read<AuthCubit>()),
                ],
                child: const CreateAppointmentScreen(),
              ),
            ),
          );
        },
        child: const Icon(Icons.add, color: AppTheme.background, size: 28),
      ),
    );
  }

  Widget _metricPill(int count, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: AppTheme.cardDecoration,
      child: Row(
        children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 6),
          Text(
            count.toString(),
            style: GoogleFonts.barlowCondensed(color: color, fontWeight: FontWeight.bold, fontSize: 10),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 9),
          ),
        ],
      ),
    );
  }
}

// ── SCREEN: APPOINTMENT DETAIL ───────────────────────────────────────────────

class AppointmentDetailScreen extends StatelessWidget {
  final Appointment appointment;

  const AppointmentDetailScreen({
    Key? key,
    required this.appointment,
  }) : super(key: key);

  void _reprogram(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: appointment.startTime,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.primary,
              onPrimary: AppTheme.background,
              surface: AppTheme.surface,
              onSurface: AppTheme.textMain,
            ),
            dialogBackgroundColor: AppTheme.background,
          ),
          child: child!,
        );
      },
    );

    if (pickedDate == null) return;

    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
    );

    List<dynamic> slots = [];
    try {
      if (appointment.services.isEmpty) {
        Navigator.pop(context); // Close loading
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No hay servicios asociados a esta cita.')),
        );
        return;
      }
      final businessId = appointment.businessId;
      final serviceId = appointment.services.first.id;
      final dateStr = "${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}";
      
      slots = await ApiClient().getAvailability(
        businessId,
        serviceId,
        dateStr,
        professionalId: appointment.professional.id,
      );
    } catch (e) {
      Navigator.pop(context); // Close loading
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al obtener disponibilidad: $e')),
      );
      return;
    }

    Navigator.pop(context); // Close loading

    if (slots.isEmpty) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: AppTheme.surface,
          title: Text('Sin Disponibilidad', style: AppTheme.titleStyle),
          content: Text('No hay huecos libres para este barbero en el día seleccionado.', style: GoogleFonts.inter(color: Colors.white)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Aceptar', style: GoogleFonts.barlowCondensed(color: AppTheme.primary)),
            ),
          ],
        ),
      );
      return;
    }

    // Show Slot Picker Dialog
    final String? selectedTimeKey = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.surface,
        title: Text('Selecciona una Hora', style: AppTheme.titleStyle),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: slots.length,
            itemBuilder: (context, index) {
              final slot = slots[index];
              final timeKey = slot['time'] as String;
              return ListTile(
                title: Text(timeKey, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
                onTap: () => Navigator.pop(context, timeKey),
              );
            },
          ),
        ),
      ),
    );

    if (selectedTimeKey == null) return;

    // Trigger reschedule
    try {
      final newStartTimeStr = "${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}T$selectedTimeKey:00.000Z";
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );

      final agendaCubit = context.read<AgendaCubit>();
      await agendaCubit.rescheduleAppointment(appointment.id, newStartTimeStr);
      
      Navigator.pop(context); // Close loading
      Navigator.pop(context); // Go back to agenda screen

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cita reprogramada con éxito')),
      );
    } catch (e) {
      Navigator.pop(context); // Close loading if open
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al reprogramar: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final initials = appointment.client.name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('');
    final timeStr = "${appointment.startTime.hour.toString().padLeft(2, '0')}:${appointment.startTime.minute.toString().padLeft(2, '0')}";
    final dateStr = DateFormat('dd MMM yyyy', 'es_ES').format(appointment.startTime);

    Color statusColor = AppTheme.statusPending;
    String statusLabel = 'CONFIRMADA';
    if (appointment.status.toLowerCase() == 'completed') {
      statusColor = AppTheme.statusCompleted;
      statusLabel = 'COMPLETADA';
    } else if (appointment.status.toLowerCase() == 'no-show') {
      statusColor = AppTheme.statusNoShow;
      statusLabel = 'NO-SHOW';
    } else if (appointment.status.toLowerCase() == 'cancelled') {
      statusColor = Colors.grey;
      statusLabel = 'CANCELADA';
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Detalle de Cita', style: AppTheme.titleStyle),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Text(
                  statusLabel,
                  style: GoogleFonts.barlowCondensed(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Client Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.cardDecoration,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppTheme.primary,
                    child: Text(
                      initials,
                      style: GoogleFonts.barlowCondensed(
                          color: AppTheme.background, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          appointment.client.name,
                          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          appointment.client.phone,
                          style: GoogleFonts.inter(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Grid Details 2x2
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.5,
              children: [
                _detailTile('Servicio', appointment.services.map((s) => s.name).join(', ')),
                _detailTile('Barbero', appointment.professional.name),
                _detailTile('Fecha y Hora', '$dateStr · $timeStr'),
                _detailTile('Precio', '${appointment.totalPrice.toInt()}€', isPrice: true),
              ],
            ),
            const SizedBox(height: 16),

            // Internal Notes
            if (appointment.notes != null && appointment.notes!.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: AppTheme.cardDecoration,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('NOTAS INTERNAS', style: AppTheme.labelStyle),
                    const SizedBox(height: 6),
                    Text(
                      appointment.notes!,
                      style: GoogleFonts.inter(color: Colors.grey[300], fontSize: 12),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Complete appointment button
            if (appointment.status.toLowerCase() != 'completed' && appointment.status.toLowerCase() != 'cancelled')
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    context.read<AgendaCubit>().updateAppointmentStatus(appointment.id, 'completed');
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.check, color: AppTheme.background),
                  label: Text(
                    'MARCAR COMO COMPLETADA',
                    style: GoogleFonts.barlowCondensed(
                        color: AppTheme.background, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                ),
              ),
            const SizedBox(height: 12),

            // Quick actions grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.8,
              children: [
                _actionBtn(Icons.refresh, 'Reprogramar', Colors.grey[300]!, () {
                  _reprogram(context);
                }),
                _actionBtn(Icons.warning, 'No-show', Colors.redAccent, () {
                  context.read<AgendaCubit>().updateAppointmentStatus(appointment.id, 'no-show');
                  Navigator.pop(context);
                }),
                _actionBtn(Icons.phone, 'Llamar', Colors.greenAccent, () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Llamando a ${appointment.client.phone}...')),
                  );
                }),
                _actionBtn(Icons.close, 'Cancelar', Colors.redAccent, () {
                  context.read<AgendaCubit>().updateAppointmentStatus(appointment.id, 'cancelled');
                  Navigator.pop(context);
                }),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailTile(String label, String value, {bool isPrice = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label.toUpperCase(), style: AppTheme.labelStyle),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: isPrice ? 18 : 13,
              fontWeight: FontWeight.bold,
              color: isPrice ? AppTheme.primary : Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2), width: 1),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.barlowCondensed(color: color, fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

// ── SCREEN: CREATE APPOINTMENT (CRUD CREATOR) ────────────────────────────────

class CreateAppointmentScreen extends StatefulWidget {
  const CreateAppointmentScreen({Key? key}) : super(key: key);

  @override
  State<CreateAppointmentScreen> createState() => _CreateAppointmentScreenState();
}

class _CreateAppointmentScreenState extends State<CreateAppointmentScreen> {
  Service? _selectedService;
  Professional? _selectedProfessional;
  DateTime _selectedDate = DateTime.now();
  String? _selectedSlot;
  List<dynamic> _availableSlots = [];
  bool _loadingSlots = false;

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSlots();
    });
  }

  Future<void> _loadSlots() async {
    if (_selectedService == null) return;
    setState(() {
      _loadingSlots = true;
      _availableSlots = [];
      _selectedSlot = null;
    });

    try {
      final authState = context.read<AuthCubit>().state;
      final businessId = authState.currentUser?.businessId ?? '';
      if (businessId.isEmpty) return;

      final dateStr = "${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}";
      
      final slots = await ApiClient().getAvailability(
        businessId,
        _selectedService!.id,
        dateStr,
        professionalId: _selectedProfessional?.id ?? 'any',
      );

      setState(() {
        _availableSlots = slots;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar horas: $e')),
      );
    } finally {
      setState(() {
        _loadingSlots = false;
      });
    }
  }

  void _saveAppointment() async {
    if (_selectedService == null || _selectedSlot == null || _nameController.text.isEmpty || _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, completa todos los campos obligatorios')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final authState = context.read<AuthCubit>().state;
      final businessId = authState.currentUser?.businessId ?? '';
      final startTimeStr = "${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}T$_selectedSlot:00.000Z";

      final apptData = {
        'businessId': businessId,
        'serviceIds': [_selectedService!.id],
        'professionalId': _selectedProfessional?.id ?? 'any',
        'startTime': startTimeStr,
        'clientName': _nameController.text,
        'clientPhone': _phoneController.text,
        if (_emailController.text.isNotEmpty) 'clientEmail': _emailController.text,
        if (_notesController.text.isNotEmpty) 'notes': _notesController.text,
      };

      await ApiClient().createAppointment(apptData);

      context.read<AgendaCubit>().fetchAppointments();
      context.read<ClientsCubit>().fetchClients();
      
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reserva creada exitosamente')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al crear reserva: $e')),
      );
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final catalogState = context.watch<CatalogCubit>().state;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Nueva Cita', style: AppTheme.titleStyle),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Select Service
            Text('SERVICIO *', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: AppTheme.cardDecoration,
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Service>(
                  dropdownColor: AppTheme.surface,
                  value: _selectedService,
                  hint: Text('Selecciona un servicio...', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13)),
                  isExpanded: true,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                  items: catalogState.services.map((Service s) {
                    return DropdownMenuItem<Service>(
                      value: s,
                      child: Text('${s.name} - ${s.price.toInt()}€ (${s.durationMinutes} min)'),
                    );
                  }).toList(),
                  onChanged: (Service? val) {
                    setState(() => _selectedService = val);
                    _loadSlots();
                  },
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Select Professional
            Text('BARBERO / ESTILISTA', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: AppTheme.cardDecoration,
              child: DropdownButtonHideUnderline(
                child: DropdownButton<Professional>(
                  dropdownColor: AppTheme.surface,
                  value: _selectedProfessional,
                  hint: Text('Cualquiera disponible', style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
                  isExpanded: true,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                  items: [
                    const DropdownMenuItem<Professional>(
                      value: null,
                      child: Text('Cualquiera disponible'),
                    ),
                    ...catalogState.professionals.map((Professional p) {
                      return DropdownMenuItem<Professional>(
                        value: p,
                        child: Text(p.name),
                      );
                    }).toList(),
                  ],
                  onChanged: (Professional? val) {
                    setState(() => _selectedProfessional = val);
                    _loadSlots();
                  },
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Date selection
            Text('FECHA Y HORA *', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary,
                      side: const BorderSide(color: AppTheme.primary, width: 1),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime.now().subtract(const Duration(days: 1)),
                        lastDate: DateTime.now().add(const Duration(days: 30)),
                      );
                      if (picked != null) {
                        setState(() => _selectedDate = picked);
                        _loadSlots();
                      }
                    },
                    icon: const Icon(Icons.calendar_month),
                    label: Text(DateFormat('dd / MM / yyyy', 'es_ES').format(_selectedDate)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Slot Picker
            if (_loadingSlots)
              const Center(child: Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator(color: AppTheme.primary)))
            else if (_selectedService == null)
              Text('Selecciona un servicio primero para ver horarios', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 11))
            else if (_availableSlots.isEmpty)
              Text('No hay horarios disponibles para este día.', style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 11))
            else ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableSlots.map((slot) {
                  final time = slot['time'] as String;
                  final isSelected = _selectedSlot == time;
                  return ChoiceChip(
                    label: Text(time, style: GoogleFonts.barlowCondensed(fontWeight: FontWeight.bold, fontSize: 12, color: isSelected ? AppTheme.background : Colors.white)),
                    selected: isSelected,
                    selectedColor: AppTheme.primary,
                    backgroundColor: AppTheme.surface,
                    onSelected: (bool selected) {
                      setState(() {
                        _selectedSlot = selected ? time : null;
                      });
                    },
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: 24),

            Divider(color: Colors.white.withOpacity(0.06)),
            const SizedBox(height: 12),

            // Client Info
            Text('DATOS DEL CLIENTE *', style: AppTheme.titleStyle.copyWith(fontSize: 16)),
            const SizedBox(height: 16),

            Text('NOMBRE Y APELLIDO *', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            TextField(
              controller: _nameController,
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                fillColor: AppTheme.surface,
                filled: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 14),

            Text('TELÉFONO *', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                fillColor: AppTheme.surface,
                filled: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 14),

            Text('EMAIL (OPCIONAL)', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                fillColor: AppTheme.surface,
                filled: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 14),

            Text('NOTAS / ALERGIAS (OPCIONAL)', style: AppTheme.labelStyle),
            const SizedBox(height: 6),
            TextField(
              controller: _notesController,
              maxLines: 2,
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                fillColor: AppTheme.surface,
                filled: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 28),

            // Save CTA Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _isSaving ? null : _saveAppointment,
                child: _isSaving
                    ? const CircularProgressIndicator(color: AppTheme.background)
                    : Text(
                        'CREAR RESERVA MANUAL',
                        style: GoogleFonts.barlowCondensed(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                          color: AppTheme.background,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── TAB: CLIENTS CRM LIST ────────────────────────────────────────────────────

class ClientsScreen extends StatefulWidget {
  const ClientsScreen({Key? key}) : super(key: key);

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    context.read<ClientsCubit>().fetchClients();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: BlocBuilder<ClientsCubit, ClientsState>(
          builder: (context, state) {
            final filtered = state.clients.where((client) {
              return client.name.toLowerCase().contains(_query.toLowerCase()) ||
                  client.phone.contains(_query);
            }).toList();

            return Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Text('Clientes CRM', style: AppTheme.titleStyle),
                    ],
                  ),
                ),

                // Search box
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _query = val),
                    style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMain),
                    decoration: InputDecoration(
                      hintText: 'Buscar cliente por nombre o teléfono...',
                      hintStyle: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMuted),
                      prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted),
                      fillColor: AppTheme.surface,
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // CRM List
                Expanded(
                  child: state.isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                      : filtered.isEmpty
                          ? Center(
                              child: Text(
                                'No se encontraron clientes.',
                                style: GoogleFonts.inter(color: AppTheme.textMuted),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: filtered.length,
                              itemBuilder: (context, index) {
                                final client = filtered[index];
                                final initials = client.name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('');
                                final isVip = client.tags.contains('VIP');
                                final isInactive = client.tags.contains('INACTIVO');

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: ListTile(
                                    tileColor: AppTheme.surface,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    leading: CircleAvatar(
                                      backgroundColor: AppTheme.primary.withOpacity(0.1),
                                      child: Text(
                                        initials,
                                        style: GoogleFonts.barlowCondensed(
                                            color: AppTheme.primary, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    title: Row(
                                      children: [
                                        Text(client.name,
                                            style: GoogleFonts.inter(
                                                fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                                        if (isVip) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                            decoration: BoxDecoration(
                                                color: AppTheme.primary, borderRadius: BorderRadius.circular(4)),
                                            child: Text('VIP',
                                                style: GoogleFonts.barlowCondensed(
                                                    fontSize: 7,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppTheme.background)),
                                          ),
                                        ],
                                        if (isInactive) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                            decoration: BoxDecoration(
                                                color: Colors.grey[700], borderRadius: BorderRadius.circular(4)),
                                            child: Text('INACTIVO',
                                                style: GoogleFonts.barlowCondensed(
                                                    fontSize: 7,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.white)),
                                          ),
                                        ]
                                      ],
                                    ),
                                    subtitle: Text(client.phone,
                                        style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
                                    trailing: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          '${client.visits} visitas',
                                          style: GoogleFonts.barlowCondensed(
                                              fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                                        ),
                                        Text(
                                          '${client.totalSpent.toInt()}€ total',
                                          style: GoogleFonts.inter(fontSize: 10, color: AppTheme.primary),
                                        ),
                                      ],
                                    ),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (routeContext) => MultiBlocProvider(
                                            providers: [
                                              BlocProvider.value(value: context.read<ClientsCubit>()),
                                              BlocProvider.value(value: context.read<AgendaCubit>()),
                                            ],
                                            child: ClientDetailScreen(client: client),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                );
                              },
                            ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

// ── SCREEN: CLIENT DETAIL CRM PROFILE ────────────────────────────────────────

class ClientDetailScreen extends StatefulWidget {
  final Client client;

  const ClientDetailScreen({
    Key? key,
    required this.client,
  }) : super(key: key);

  @override
  State<ClientDetailScreen> createState() => _ClientDetailScreenState();
}

class _ClientDetailScreenState extends State<ClientDetailScreen> {
  late final TextEditingController _notesController;
  bool _loadingDetail = true;
  Map<String, dynamic>? _clientDetail;

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController(text: widget.client.notes);
    _loadClientDetail();
  }

  Future<void> _loadClientDetail() async {
    try {
      final response = await ApiClient().dio.get('/clients/${widget.client.id}');
      setState(() {
        _clientDetail = response.data;
        _loadingDetail = false;
      });
    } catch (_) {
      setState(() {
        _loadingDetail = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final initials = widget.client.name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('');
    final List clientAppts = _clientDetail?['appointments'] ?? [];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.primary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text('Ficha de Cliente', style: AppTheme.titleStyle),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: AppTheme.cardDecoration,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppTheme.primary.withOpacity(0.1),
                    child: Text(
                      initials,
                      style: GoogleFonts.barlowCondensed(
                          color: AppTheme.primary, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.client.name,
                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(widget.client.phone, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey)),
                        if (widget.client.email != null)
                          Text(widget.client.email!, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Metrics row
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: AppTheme.cardDecoration,
                    child: Column(
                      children: [
                        Text('VISITAS', style: AppTheme.labelStyle),
                        const SizedBox(height: 4),
                        Text(
                          widget.client.visits.toString(),
                          style: GoogleFonts.barlowCondensed(
                              fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: AppTheme.cardDecoration,
                    child: Column(
                      children: [
                        Text('GASTO ACUMULADO', style: AppTheme.labelStyle),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.client.totalSpent.toInt()}€',
                          style: GoogleFonts.barlowCondensed(
                              fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // CRM styling notes
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: AppTheme.cardDecoration,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('NOTAS / ALERGIAS / PREFERENCIAS', style: AppTheme.labelStyle),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _notesController,
                    maxLines: 3,
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Escribe notas importantes sobre este cliente...',
                      hintStyle: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12),
                      fillColor: Colors.black.withOpacity(0.3),
                      filled: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, elevation: 0),
                      onPressed: () {
                        context.read<ClientsCubit>().updateClientNotes(widget.client.id, _notesController.text);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Notas actualizadas correctamente')),
                        );
                      },
                      child: Text(
                        'Guardar Nota',
                        style: GoogleFonts.barlowCondensed(color: AppTheme.background, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Historical Title
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'HISTORIAL DE CITAS',
                style: AppTheme.labelStyle,
              ),
            ),
            const SizedBox(height: 10),

            // Historical List Dynamic
            if (_loadingDetail)
              const Center(child: CircularProgressIndicator(color: AppTheme.primary))
            else if (clientAppts.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.cardDecoration,
                child: Center(
                  child: Text('Este cliente no posee reservas previas.', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: clientAppts.length,
                itemBuilder: (context, index) {
                  final appt = clientAppts[index];
                  final price = double.tryParse(appt['totalPrice'].toString()) ?? 0.0;
                  final rawStart = appt['startTime'] as String;
                  final startTime = DateTime.tryParse(rawStart) ?? DateTime.now();
                  final dateStr = DateFormat('dd MMM yyyy · HH:mm', 'es_ES').format(startTime);
                  
                  final List servicesList = appt['services'] ?? [];
                  final servicesNames = servicesList.map((item) {
                    if (item['service'] != null) return item['service']['name'];
                    return item['name'];
                  }).join(', ');

                  final profName = appt['professional'] != null ? appt['professional']['name'] : 'Barbero';
                  final statusStr = (appt['status'] as String).toUpperCase();

                  return Card(
                    color: AppTheme.surface,
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  servicesNames,
                                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 2),
                                Text('$dateStr · con $profName', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('${price.toInt()}€', style: GoogleFonts.barlowCondensed(fontSize: 14, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                              Text(statusStr, style: GoogleFonts.barlowCondensed(fontSize: 8, color: Colors.grey, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}

// ── TAB: CAJA DAILY TRANSACTION LOGS ─────────────────────────────────────────

class CajaScreen extends StatelessWidget {
  const CajaScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AgendaCubit, AgendaState>(
      builder: (context, state) {
        final completedAppts = state.appointments
            .where((a) => a.status.toLowerCase() == 'completed')
            .toList();

        final totalIncome = completedAppts.fold<double>(
          0.0,
          (sum, a) => sum + a.totalPrice,
        );

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Control de Caja', style: AppTheme.titleStyle),
                const SizedBox(height: 16),
                
                // Stats Grid
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: AppTheme.cardDecoration,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('INGRESOS HOY', style: AppTheme.labelStyle),
                            const SizedBox(height: 4),
                            Text(
                              '${totalIncome.toInt()}€',
                              style: GoogleFonts.barlowCondensed(
                                  fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primary),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: AppTheme.cardDecoration,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('TRANSACCIONES', style: AppTheme.labelStyle),
                            const SizedBox(height: 4),
                            Text(
                              '${completedAppts.length} cobros',
                              style: GoogleFonts.barlowCondensed(
                                  fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Actions
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          backgroundColor: AppTheme.surface,
                          title: Text('Cierre de Caja', style: AppTheme.titleStyle),
                          content: Text('¿Deseas efectuar el cierre de caja para el día de hoy por un total de ${totalIncome.toInt()}€?', style: GoogleFonts.inter(color: Colors.white)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: Text('CANCELAR', style: GoogleFonts.barlowCondensed(color: Colors.grey)),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Cierre de caja diario efectuado con éxito')),
                                );
                              },
                              child: Text('EFECTUAR CIERRE', style: GoogleFonts.barlowCondensed(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      );
                    },
                    icon: const Icon(Icons.lock, color: AppTheme.background),
                    label: Text(
                      'EFECTUAR CIERRE DE CAJA DIARIO',
                      style: GoogleFonts.barlowCondensed(
                          color: AppTheme.background, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                Text('COBROS REGISTRADOS', style: AppTheme.labelStyle),
                const SizedBox(height: 12),

                Expanded(
                  child: completedAppts.isEmpty
                      ? Center(
                          child: Text('No hay cobros registrados hoy.', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12)),
                        )
                      : ListView.builder(
                          itemCount: completedAppts.length,
                          itemBuilder: (context, index) {
                            final appt = completedAppts[index];
                            final time = "${appt.startTime.hour.toString().padLeft(2, '0')}:${appt.startTime.minute.toString().padLeft(2, '0')}";
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8.0),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: AppTheme.cardDecoration,
                                child: Row(
                                  children: [
                                    const Icon(Icons.credit_card, color: Colors.blueAccent, size: 18),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(appt.client.name, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                                          Text('${appt.services.map((s) => s.name).join(', ')} · $time', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '${appt.totalPrice.toInt()}€',
                                      style: GoogleFonts.barlowCondensed(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── TAB: STATS/METRICS PAGE ──────────────────────────────────────────────────

class StatsScreen extends StatelessWidget {
  const StatsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AgendaCubit, AgendaState>(
      builder: (context, state) {
        final completed = state.appointments.where((a) => a.status.toLowerCase() == 'completed').length;
        final pending = state.appointments.where((a) => a.status.toLowerCase() == 'confirmed' || a.status.toLowerCase() == 'pending').length;
        final noShow = state.appointments.where((a) => a.status.toLowerCase() == 'no-show').length;
        
        final double revenue = state.appointments
            .where((a) => a.status.toLowerCase() == 'completed')
            .fold(0.0, (sum, a) => sum + a.totalPrice);
            
        final occupationRate = state.appointments.isEmpty ? 0 : ((state.appointments.length / 8.0) * 100.0).clamp(0, 100).toInt();

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListView(
              children: [
                Text('Métricas de Rendimiento', style: AppTheme.titleStyle),
                const SizedBox(height: 16),
                
                // Metrics grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                  children: [
                    _statCard('OCUPACIÓN', '$occupationRate%', AppTheme.primary),
                    _statCard('FACTURADO', '${revenue.toInt()}€', AppTheme.statusCompleted),
                    _statCard('COMPLETADAS', '$completed', Colors.white),
                    _statCard('NO-SHOW', '$noShow', AppTheme.statusNoShow),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: AppTheme.cardDecoration,
                  child: Column(
                    children: [
                      const Icon(Icons.analytics, color: AppTheme.primary, size: 36),
                      const SizedBox(height: 12),
                      Text(
                        'Estadísticas y Análisis Comercial',
                        style: GoogleFonts.inter(fontSize: 13, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Estos valores se calculan dinámicamente según la agenda y estado de las reservas para el día de hoy, brindando un control instantáneo sobre el rendimiento comercial.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _statCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: AppTheme.labelStyle),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.barlowCondensed(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class WaitlistScreen extends StatefulWidget {
  const WaitlistScreen({Key? key}) : super(key: key);

  @override
  State<WaitlistScreen> createState() => _WaitlistScreenState();
}

class _WaitlistScreenState extends State<WaitlistScreen> {
  late final WaitlistCubit _waitlistCubit;

  @override
  void initState() {
    super.initState();
    _waitlistCubit = WaitlistCubit()..fetchWaitlist();
  }

  @override
  void dispose() {
    _waitlistCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _waitlistCubit,
      child: Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          backgroundColor: AppTheme.surfaceLowest,
          title: Text('LISTA DE ESPERA', style: GoogleFonts.barlowCondensed(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          centerTitle: true,
        ),
        body: BlocBuilder<WaitlistCubit, WaitlistState>(
          builder: (context, state) {
            if (state.isLoading) {
              return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
            }

            if (state.entries.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.hourglass_empty, size: 64, color: AppTheme.textMuted),
                    const SizedBox(height: 16),
                    Text('No hay clientes en espera', style: GoogleFonts.inter(color: AppTheme.textMuted)),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.entries.length,
              itemBuilder: (context, index) {
                final entry = state.entries[index];
                final client = entry['client'] ?? {};
                final prof = entry['professional'] ?? {};
                final dateStr = DateTime.parse(entry['requestedDate']).toLocal().toString().split(' ')[0];

                return Card(
                  color: AppTheme.surface,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Colors.white10)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          justifyAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(
                              client['name'] ?? 'Cliente Anónimo',
                              style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                              onPressed: () {
                                context.read<WaitlistCubit>().deleteEntry(entry['id']);
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Teléfono: ${client['phone'] ?? ""}', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13)),
                        Text('Email: ${client['email'] ?? "No especificado"}', style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13)),
                        const Divider(color: Colors.white10, height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('FECHA', style: GoogleFonts.barlowCondensed(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11)),
                                const SizedBox(height: 2),
                                Text(dateStr, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('HORARIO PREFERIDO', style: GoogleFonts.barlowCondensed(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11)),
                                const SizedBox(height: 2),
                                Text('${entry['preferredStart']} - ${entry['preferredEnd']}', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('ESTILISTA', style: GoogleFonts.barlowCondensed(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 11)),
                                const SizedBox(height: 2),
                                Text(prof['name'] ?? 'Cualquiera', style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class CommissionsScreen extends StatefulWidget {
  const CommissionsScreen({Key? key}) : super(key: key);

  @override
  State<CommissionsScreen> createState() => _CommissionsScreenState();
}

class _CommissionsScreenState extends State<CommissionsScreen> {
  late final CommissionsCubit _commissionsCubit;
  String _selectedProfessionalId = 'p1'; // Rafa

  @override
  void initState() {
    super.initState();
    _commissionsCubit = CommissionsCubit()..fetchCommissions(_selectedProfessionalId);
  }

  @override
  void dispose() {
    _commissionsCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _commissionsCubit,
      child: Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          backgroundColor: AppTheme.surfaceLowest,
          title: Text('COMISIONES Y LIQUIDACIÓN', style: GoogleFonts.barlowCondensed(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          centerTitle: true,
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('SELECCIONAR PROFESIONAL', style: GoogleFonts.barlowCondensed(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedProfessionalId = 'p1');
                        _commissionsCubit.fetchCommissions('p1');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedProfessionalId == 'p1' ? AppTheme.primary.withOpacity(0.1) : AppTheme.surface,
                          border: Border.all(color: _selectedProfessionalId == 'p1' ? AppTheme.primary : Colors.white10),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('Rafa', textAlign: TextAlign.center, style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: _selectedProfessionalId == 'p1' ? AppTheme.primary : Colors.white)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedProfessionalId = 'p2');
                        _commissionsCubit.fetchCommissions('p2');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedProfessionalId == 'p2' ? AppTheme.primary.withOpacity(0.1) : AppTheme.surface,
                          border: Border.all(color: _selectedProfessionalId == 'p2' ? AppTheme.primary : Colors.white10),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('Luis', textAlign: TextAlign.center, style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: _selectedProfessionalId == 'p2' ? AppTheme.primary : Colors.white)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              BlocBuilder<CommissionsCubit, CommissionsState>(
                builder: (context, state) {
                  if (state.isLoading) {
                    return const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 24), child: CircularProgressIndicator(color: AppTheme.primary)));
                  }

                  final data = state.data;
                  final total = data['totalAmount'] ?? 0.0;
                  final list = data['commissions'] as List<dynamic>? ?? [];

                  return Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: AppTheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: Column(
                            children: [
                              Text('COMISIÓN ACUMULADA', style: GoogleFonts.barlowCondensed(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text('${total.toStringAsFixed(2)}€', style: GoogleFonts.barlowCondensed(color: AppTheme.primary, fontSize: 32, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Periodo: Mes actual', style: GoogleFonts.inter(color: Colors.white30, fontSize: 11)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text('DESGLOSE DE SERVICIOS', style: GoogleFonts.barlowCondensed(color: AppTheme.textMuted, fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(height: 12),
                        Expanded(
                          child: list.isEmpty
                              ? Center(child: Text('No hay comisiones registradas en el periodo', style: GoogleFonts.inter(color: AppTheme.textMuted)))
                              : ListView.builder(
                                  itemCount: list.length,
                                  itemBuilder: (context, index) {
                                    final comm = list[index];
                                    final appt = comm['appointment'] ?? {};
                                    final client = appt['client'] ?? {};

                                    return Card(
                                      color: AppTheme.surfaceLowest,
                                      margin: const EdgeInsets.only(bottom: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      child: ListTile(
                                        title: Text(client['name'] ?? 'Cliente', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
                                        subtitle: Text(
                                          'Servicio: ${appt['totalPrice']}€ · Tasa: ${comm['rateValue']}%',
                                          style: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 12),
                                        ),
                                        trailing: Text(
                                          '+${comm['amount']}€',
                                          style: GoogleFonts.inter(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 16),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
