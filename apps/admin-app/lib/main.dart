import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'presentation/controllers.dart';
import 'presentation/screens.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize date formatting in Spanish locale
  await initializeDateFormatting('es_ES', null);
  
  final authCubit = AuthCubit();
  await authCubit.checkToken();

  runApp(
    BlocProvider<AuthCubit>.value(
      value: authCubit,
      child: const AdminApp(),
    ),
  );
}

class AdminApp extends StatelessWidget {
  const AdminApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CitCalendar Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: AppTheme.background,
        primaryColor: AppTheme.primary,
        colorScheme: const ColorScheme.dark(
          primary: AppTheme.primary,
          secondary: AppTheme.primaryLight,
          surface: AppTheme.surface,
          background: AppTheme.background,
        ),
      ),
      home: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Scaffold(
              backgroundColor: AppTheme.background,
              body: Center(
                child: CircularProgressIndicator(color: AppTheme.primary),
              ),
            );
          }
          
          if (state.currentUser == null) {
            return const LoginScreen();
          }
          
          return const MainDashboard();
        },
      ),
    );
  }
}
