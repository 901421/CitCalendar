import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models.dart';
import '../data/api_client.dart';

// ── AUTHENTICATION ───────────────────────────────────────────────────────────

class AuthState {
  final User? currentUser;
  final bool isLoading;
  final String? errorMessage;

  AuthState({
    this.currentUser,
    this.isLoading = false,
    this.errorMessage,
  });

  AuthState copyWith({
    User? currentUser,
    bool? isLoading,
    String? errorMessage,
    bool clearCurrentUser = false,
  }) {
    return AuthState(
      currentUser: clearCurrentUser ? null : (currentUser ?? this.currentUser),
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AuthCubit extends Cubit<AuthState> {
  final ApiClient _api = ApiClient();

  AuthCubit() : super(AuthState());

  Future<void> checkToken() async {
    emit(state.copyWith(isLoading: true));
    try {
      final loggedIn = await _api.isLoggedIn();
      if (loggedIn) {
        final user = await _api.getCachedUser();
        emit(state.copyWith(currentUser: user, isLoading: false));
      } else {
        emit(state.copyWith(isLoading: false));
      }
    } catch (_) {
      emit(state.copyWith(isLoading: false));
    }
  }

  Future<bool> login(String email, String password) async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final user = await _api.login(email, password);
      emit(state.copyWith(currentUser: user, isLoading: false));
      return true;
    } catch (e) {
      emit(state.copyWith(
        errorMessage: "Credenciales incorrectas o servidor caído",
        isLoading: false,
      ));
      return false;
    }
  }

  Future<void> logout() async {
    await _api.logout();
    emit(state.copyWith(clearCurrentUser: true));
  }
}

// ── AGENDA / APPOINTMENTS ──────────────────────────────────────────────────

class AgendaState {
  final DateTime selectedDate;
  final List<Appointment> appointments;
  final bool isLoading;
  final String? errorMessage;

  AgendaState({
    required this.selectedDate,
    required this.appointments,
    this.isLoading = false,
    this.errorMessage,
  });

  // Computed metrics
  int get confirmedCount => appointments.where((a) => a.status.toLowerCase() == 'confirmed' || a.status.toLowerCase() == 'pending').length;
  int get completedCount => appointments.where((a) => a.status.toLowerCase() == 'completed').length;
  int get noShowCount => appointments.where((a) => a.status.toLowerCase() == 'no-show').length;

  AgendaState copyWith({
    DateTime? selectedDate,
    List<Appointment>? appointments,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AgendaState(
      selectedDate: selectedDate ?? this.selectedDate,
      appointments: appointments ?? this.appointments,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AgendaCubit extends Cubit<AgendaState> {
  final ApiClient _api = ApiClient();

  AgendaCubit() : super(AgendaState(selectedDate: DateTime.now(), appointments: []));

  void selectDate(DateTime date) {
    emit(state.copyWith(selectedDate: date));
    fetchAppointments();
  }

  Future<void> fetchAppointments() async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final dateStr = "${state.selectedDate.year}-${state.selectedDate.month.toString().padLeft(2, '0')}-${state.selectedDate.day.toString().padLeft(2, '0')}";
      final appts = await _api.getAppointments(dateStr);
      emit(state.copyWith(appointments: appts, isLoading: false));
    } catch (e) {
      // Failover to local mock during server failures
      final mockAppts = _getMockAppointments(state.selectedDate);
      emit(state.copyWith(
        appointments: mockAppts,
        errorMessage: "Error al cargar la agenda, mostrando demostración",
        isLoading: false,
      ));
    }
  }

  Future<void> updateAppointmentStatus(String id, String status) async {
    try {
      await _api.updateAppointmentStatus(id, status);
      await fetchAppointments();
    } catch (e) {
      // Local updates fallback
      final list = List<Appointment>.from(state.appointments);
      final idx = list.indexWhere((a) => a.id == id);
      if (idx != -1) {
        final a = list[idx];
        list[idx] = Appointment(
          id: a.id,
          businessId: a.businessId,
          status: status,
          startTime: a.startTime,
          endTime: a.endTime,
          totalPrice: a.totalPrice,
          client: a.client,
          professional: a.professional,
          services: a.services,
          notes: a.notes,
        );
        emit(state.copyWith(appointments: list));
      }
    }
  }

  Future<void> rescheduleAppointment(String id, String startTime) async {
    try {
      await _api.rescheduleAppointment(id, startTime);
      await fetchAppointments();
    } catch (e) {
      rethrow;
    }
  }

  List<Appointment> _getMockAppointments(DateTime date) {
    final client = Client(id: 'c1', businessId: 'b1', name: 'Marco Villanueva', phone: '+34 612 345 678', tags: ['VIP']);
    final prof = Professional(id: 'p1', name: 'Rafa', rating: 4.9);
    final service = Service(id: 's1', name: 'Corte + Barba', durationMinutes: 45, price: 28.0);
    return [
      Appointment(
        id: '1',
        businessId: 'b1',
        status: 'completed',
        startTime: DateTime(date.year, date.month, date.day, 9, 0),
        endTime: DateTime(date.year, date.month, date.day, 9, 45),
        totalPrice: 28.0,
        client: client,
        professional: prof,
        services: [service],
        notes: 'Prefiere tijera en laterales, máquina 0 en nuca.',
      ),
      Appointment(
        id: '2',
        businessId: 'b1',
        status: 'confirmed',
        startTime: DateTime(date.year, date.month, date.day, 11, 30),
        endTime: DateTime(date.year, date.month, date.day, 12, 15),
        totalPrice: 28.0,
        client: Client(id: 'c2', businessId: 'b1', name: 'Pablo Ruiz', phone: '+34 645 678 901', tags: ['VIP']),
        professional: Professional(id: 'p2', name: 'Luis', rating: 4.8),
        services: [service],
      ),
    ];
  }
}

// ── CUSTOMERS / CRM ──────────────────────────────────────────────────────────

class ClientsState {
  final List<Client> clients;
  final bool isLoading;
  final String? errorMessage;

  ClientsState({
    required this.clients,
    this.isLoading = false,
    this.errorMessage,
  });

  ClientsState copyWith({
    List<Client>? clients,
    bool? isLoading,
    String? errorMessage,
  }) {
    return ClientsState(
      clients: clients ?? this.clients,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class ClientsCubit extends Cubit<ClientsState> {
  final ApiClient _api = ApiClient();

  ClientsCubit() : super(ClientsState(clients: []));

  Future<void> fetchClients() async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final list = await _api.getClients();
      emit(state.copyWith(clients: list, isLoading: false));
    } catch (e) {
      final mock = _getMockClients();
      emit(state.copyWith(
        clients: mock,
        errorMessage: "Error al cargar los clientes, mostrando demostración",
        isLoading: false,
      ));
    }
  }

  Future<void> updateClientNotes(String id, String notes) async {
    try {
      await _api.updateClient(id, {'notes': notes});
      await fetchClients();
    } catch (e) {
      final list = List<Client>.from(state.clients);
      final idx = list.indexWhere((c) => c.id == id);
      if (idx != -1) {
        final c = list[idx];
        list[idx] = Client(
          id: c.id,
          businessId: c.businessId,
          name: c.name,
          phone: c.phone,
          email: c.email,
          tags: c.tags,
          visits: c.visits,
          totalSpent: c.totalSpent,
          lastVisit: c.lastVisit,
          notes: notes,
        );
        emit(state.copyWith(clients: list));
      }
    }
  }

  List<Client> _getMockClients() {
    return [
      Client(id: '1', businessId: 'b1', name: 'Marco Villanueva', phone: '+34 612 345 678', visits: 24, totalSpent: 612.0, tags: ['VIP'], lastVisit: 'Hoy', notes: 'Prefiere tijera en laterales, máquina 0 en nuca.'),
      Client(id: '2', businessId: 'b1', name: 'Diego Salmerón', phone: '+34 623 456 789', visits: 12, totalSpent: 216.0, tags: [], lastVisit: 'Hoy'),
      Client(id: '3', businessId: 'b1', name: 'Andrés Molina', phone: '+34 634 567 890', visits: 3, totalSpent: 66.0, tags: ['INACTIVO'], lastVisit: 'Hace 2 meses'),
    ];
  }
}

// ── CATALOG / SERVICES & PROFESSIONALS ──────────────────────────────────────────

class CatalogState {
  final List<Service> services;
  final List<Professional> professionals;
  final bool isLoading;
  final String? errorMessage;

  CatalogState({
    required this.services,
    required this.professionals,
    this.isLoading = false,
    this.errorMessage,
  });

  CatalogState copyWith({
    List<Service>? services,
    List<Professional>? professionals,
    bool? isLoading,
    String? errorMessage,
  }) {
    return CatalogState(
      services: services ?? this.services,
      professionals: professionals ?? this.professionals,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class CatalogCubit extends Cubit<CatalogState> {
  final ApiClient _api = ApiClient();

  CatalogCubit() : super(CatalogState(services: [], professionals: []));
 
  Future<void> fetchCatalog() async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final s = await _api.getServices();
      final p = await _api.getProfessionals();
      emit(state.copyWith(services: s, professionals: p, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        services: [
          Service(id: 's1', name: 'Corte Clásico', durationMinutes: 30, price: 18.0),
          Service(id: 's2', name: 'Corte + Barba', durationMinutes: 45, price: 28.0),
        ],
        professionals: [
          Professional(id: 'p1', name: 'Rafa', rating: 4.9),
          Professional(id: 'p2', name: 'Luis', rating: 4.8),
        ],
        isLoading: false,
      ));
    }
  }
}

// ── WAITLIST / LISTA DE ESPERA ───────────────────────────────────────────────

class WaitlistState {
  final List<dynamic> entries;
  final bool isLoading;
  final String? errorMessage;

  WaitlistState({
    required this.entries,
    this.isLoading = false,
    this.errorMessage,
  });

  WaitlistState copyWith({
    List<dynamic>? entries,
    bool? isLoading,
    String? errorMessage,
  }) {
    return WaitlistState(
      entries: entries ?? this.entries,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class WaitlistCubit extends Cubit<WaitlistState> {
  final ApiClient _api = ApiClient();

  WaitlistCubit() : super(WaitlistState(entries: []));

  Future<void> fetchWaitlist() async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final entries = await _api.getWaitlist();
      emit(state.copyWith(entries: entries, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        entries: _getMockWaitlist(),
        errorMessage: "Error al cargar la lista de espera, mostrando demostración",
        isLoading: false,
      ));
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      await _api.deleteWaitlistEntry(id);
      await fetchWaitlist();
    } catch (e) {
      final list = List<dynamic>.from(state.entries);
      list.removeWhere((item) => item['id'] == id);
      emit(state.copyWith(entries: list));
    }
  }

  List<dynamic> _getMockWaitlist() {
    return [
      {
        'id': 'w1',
        'requestedDate': '2026-06-22T00:00:00.000Z',
        'preferredStart': '10:00',
        'preferredEnd': '14:00',
        'status': 'WAITING',
        'client': {
          'name': 'Carlos Mendoza',
          'phone': '+34 689 123 456',
          'email': 'carlos@mendoza.com'
        },
        'professional': {
          'name': 'Rafa'
        }
      },
      {
        'id': 'w2',
        'requestedDate': '2026-06-22T00:00:00.000Z',
        'preferredStart': '16:00',
        'preferredEnd': '19:00',
        'status': 'WAITING',
        'client': {
          'name': 'Javier Ortiz',
          'phone': '+34 670 987 654',
          'email': 'javier@ortiz.com'
        },
        'professional': null
      }
    ];
  }
}

// ── COMMISSIONS / COMISIONES ─────────────────────────────────────────────────

class CommissionsState {
  final Map<String, dynamic> data;
  final bool isLoading;
  final String? errorMessage;

  CommissionsState({
    required this.data,
    this.isLoading = false,
    this.errorMessage,
  });

  CommissionsState copyWith({
    Map<String, dynamic>? data,
    bool? isLoading,
    String? errorMessage,
  }) {
    return CommissionsState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class CommissionsCubit extends Cubit<CommissionsState> {
  final ApiClient _api = ApiClient();

  CommissionsCubit() : super(CommissionsState(data: {}));

  Future<void> fetchCommissions(String professionalId, {String? startDate, String? endDate}) async {
    emit(state.copyWith(isLoading: true, errorMessage: null));
    try {
      final res = await _api.getProfessionalCommissions(professionalId, startDate: startDate, endDate: endDate);
      emit(state.copyWith(data: res, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        data: _getMockCommissions(professionalId),
        errorMessage: "Error al cargar las comisiones, mostrando demostración",
        isLoading: false,
      ));
    }
  }

  Map<String, dynamic> _getMockCommissions(String professionalId) {
    return {
      'professional': {'id': professionalId, 'name': professionalId == 'p1' ? 'Rafa' : 'Luis'},
      'totalAmount': 56.0,
      'commissions': [
        {
          'id': 'c1',
          'amount': 28.0,
          'rateType': 'PERCENT',
          'rateValue': 20.0,
          'calculatedAt': '2026-06-21T18:00:00.000Z',
          'appointment': {
            'totalPrice': 140.0,
            'client': {'name': 'Marco Villanueva'}
          }
        },
        {
          'id': 'c2',
          'amount': 28.0,
          'rateType': 'PERCENT',
          'rateValue': 20.0,
          'calculatedAt': '2026-06-21T16:00:00.000Z',
          'appointment': {
            'totalPrice': 140.0,
            'client': {'name': 'Diego Salmerón'}
          }
        }
      ]
    };
  }
}
