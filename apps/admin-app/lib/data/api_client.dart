import 'dart:io';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';

class ApiClient {
  late final Dio _dio;
  
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  Dio get dio => _dio;

  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: _getBaseUrl(),
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 5),
    ));

    // Inject JWT Token interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          print('API Error: ${e.response?.statusCode} - ${e.message}');
          return handler.next(e);
        },
      ),
    );
  }

  String _getBaseUrl() {
    // If running on Android Emulator, localhost is 10.0.2.2.
    // Otherwise, standard localhost is 127.0.0.1.
    try {
      if (Platform.isAndroid) {
        return "http://10.0.2.2:3001";
      }
    } catch (_) {}
    return "http://localhost:3001";
  }

  // Set auth token
  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  // Clear auth token
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_data');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return token != null && token.isNotEmpty;
  }

  // ── AUTH ───────────────────────────────────────────────────────────────────

  Future<User> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final token = response.data['token'] as String;
      await setToken(token);

      final userData = response.data['user'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_data', jsonEncode(userData));

      return User.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<User?> getCachedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user_data');
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  // ── APPOINTMENTS ───────────────────────────────────────────────────────────

  Future<List<Appointment>> getAppointments(String date) async {
    try {
      final response = await _dio.get('/appointments', queryParameters: {
        'date': date,
      });
      final List list = response.data;
      return list.map((json) => Appointment.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Appointment> updateAppointmentStatus(String id, String status) async {
    try {
      final response = await _dio.patch('/appointments/$id/status', data: {
        'status': status,
      });
      return Appointment.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Appointment> createAppointment(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/appointments', data: data);
      return Appointment.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Appointment> rescheduleAppointment(String id, String startTime) async {
    try {
      final response = await _dio.patch('/appointments/$id', data: {
        'startTime': startTime,
      });
      return Appointment.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // ── CLIENTS ────────────────────────────────────────────────────────────────

  Future<List<Client>> getClients() async {
    try {
      final response = await _dio.get('/clients');
      final List list = response.data;
      return list.map((json) => Client.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Client> getClientDetail(String id) async {
    try {
      final response = await _dio.get('/clients/$id');
      return Client.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Client> createClient(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/clients', data: data);
      return Client.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Client> updateClient(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('/clients/$id', data: data);
      return Client.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // ── SERVICES ───────────────────────────────────────────────────────────────

  Future<List<Service>> getServices() async {
    try {
      final response = await _dio.get('/services');
      final List list = response.data;
      return list.map((json) => Service.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // ── PROFESSIONALS ──────────────────────────────────────────────────────────

  Future<List<Professional>> getProfessionals() async {
    try {
      final response = await _dio.get('/professionals');
      final List list = response.data;
      return list.map((json) => Professional.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getAvailability(String businessId, String serviceIds, String date, {String? professionalId}) async {
    try {
      final queryParams = {
        'businessId': businessId,
        'serviceIds': serviceIds,
        'date': date,
      };
      if (professionalId != null && professionalId != 'any') {
        queryParams['professionalId'] = professionalId;
      }
      final response = await _dio.get('/appointments/availability', queryParameters: queryParams);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}
