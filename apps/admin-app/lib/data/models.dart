import 'dart:convert';

class User {
  final String id;
  final String email;
  final String name;
  final String role;
  final String businessId;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.businessId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? '',
      businessId: json['businessId'] ?? '',
    );
  }
}

class Service {
  final String id;
  final String name;
  final String? description;
  final int durationMinutes;
  final double price;
  final String? category;

  Service({
    required this.id,
    required this.name,
    this.description,
    required this.durationMinutes,
    required this.price,
    this.category,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      durationMinutes: json['durationMinutes'] ?? 0,
      price: double.tryParse(json['price'].toString()) ?? 0.0,
      category: json['category'],
    );
  }
}

class Professional {
  final String id;
  final String name;
  final String? photoUrl;
  final String? bio;
  final double rating;

  Professional({
    required this.id,
    required this.name,
    this.photoUrl,
    this.bio,
    required this.rating,
  });

  factory Professional.fromJson(Map<String, dynamic> json) {
    return Professional(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      photoUrl: json['photoUrl'],
      bio: json['bio'],
      rating: double.tryParse(json['rating'].toString()) ?? 5.0,
    );
  }
}

class Client {
  final String id;
  final String businessId;
  final String name;
  final String? email;
  final String phone;
  final String? notes;
  final List<String> tags;
  final int visits;
  final double totalSpent;
  final String lastVisit;

  Client({
    required this.id,
    required this.businessId,
    required this.name,
    this.email,
    required this.phone,
    this.notes,
    required this.tags,
    this.visits = 0,
    this.totalSpent = 0.0,
    this.lastVisit = 'Nunca',
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'] ?? '',
      businessId: json['businessId'] ?? '',
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'] ?? '',
      notes: json['notes'],
      tags: List<String>.from(json['tags'] ?? []),
      visits: json['visits'] ?? json['visitsCount'] ?? 0,
      totalSpent: double.tryParse(json['totalSpent'].toString()) ?? 0.0,
      lastVisit: json['lastVisit'] ?? 'Nunca',
    );
  }
}

class Appointment {
  final String id;
  final String businessId;
  final String status;
  final DateTime startTime;
  final DateTime endTime;
  final String? notes;
  final double totalPrice;
  final Client client;
  final Professional professional;
  final List<Service> services;

  Appointment({
    required this.id,
    required this.businessId,
    required this.status,
    required this.startTime,
    required this.endTime,
    this.notes,
    required this.totalPrice,
    required this.client,
    required this.professional,
    required this.services,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    // Determine client
    Client resolvedClient;
    if (json['client'] != null) {
      resolvedClient = Client.fromJson(json['client']);
    } else {
      resolvedClient = Client(id: '', businessId: json['businessId'] ?? '', name: 'Cliente Anónimo', phone: '');
    }

    // Determine professional
    Professional resolvedProf;
    if (json['professional'] != null) {
      resolvedProf = Professional.fromJson(json['professional']);
    } else {
      resolvedProf = Professional(id: '', name: 'Estilista', rating: 5.0);
    }

    // Determine services
    List<Service> resolvedServices = [];
    if (json['services'] != null) {
      resolvedServices = (json['services'] as List).map((item) {
        // Handle junction table include format or direct format
        if (item['service'] != null) {
          return Service.fromJson(item['service']);
        }
        return Service.fromJson(item);
      }).toList();
    }

    return Appointment(
      id: json['id'] ?? '',
      businessId: json['businessId'] ?? '',
      status: json['status'] ?? 'PENDING',
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      notes: json['notes'],
      totalPrice: double.tryParse(json['totalPrice'].toString()) ?? 0.0,
      client: resolvedClient,
      professional: resolvedProf,
      services: resolvedServices,
    );
  }
}
