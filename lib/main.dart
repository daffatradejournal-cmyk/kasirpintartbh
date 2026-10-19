import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/database/database_helper.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/cubit/auth_cubit.dart';
import 'features/auth/views/store_profile_screen.dart';
import 'features/inventory/cubit/inventory_cubit.dart';
import 'features/inventory/cubit/inventory_state.dart';
import 'features/inventory/views/product_list_screen.dart';
import 'features/pos/cubit/pos_cubit.dart';
import 'features/pos/views/cashier_screen.dart';
import 'features/reports/cubit/reports_cubit.dart';
import 'features/reports/views/daily_summary_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize SQLite database & seed initial store catalog
  try {
    await DatabaseHelper.instance.database;
  } catch (e) {
    debugPrint('Database initialization warning: $e');
  }

  runApp(const InhilPosApp());
}

class InhilPosApp extends StatelessWidget {
  const InhilPosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthCubit>(
          create: (_) => AuthCubit()..loadProfile(),
        ),
        BlocProvider<InventoryCubit>(
          create: (_) => InventoryCubit()..loadProducts(),
        ),
        BlocProvider<PosCubit>(
          create: (_) => PosCubit(),
        ),
        BlocProvider<ReportsCubit>(
          create: (_) => ReportsCubit()..loadReports(),
        ),
      ],
      child: MaterialApp(
        title: 'InhilPOS Mobile',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const MainNavigationScreen(),
      ),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CashierScreen(),
    ProductListScreen(),
    DailySummaryScreen(),
    StoreProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BlocBuilder<InventoryCubit, InventoryState>(
        builder: (context, invState) {
          final lowStockCount = invState.lowStockCount;

          return NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) {
              setState(() => _currentIndex = index);
              // When switching to reports or inventory, reload fresh data
              if (index == 1) {
                context.read<InventoryCubit>().loadProducts();
              } else if (index == 2) {
                context.read<ReportsCubit>().loadReports();
              }
            },
            destinations: [
              const NavigationDestination(
                icon: Icon(Icons.point_of_sale_outlined),
                selectedIcon: Icon(Icons.point_of_sale_rounded, color: AppColors.primary),
                label: 'Kasir',
              ),
              NavigationDestination(
                icon: Badge(
                  isLabelVisible: lowStockCount > 0,
                  label: Text(lowStockCount.toString()),
                  backgroundColor: AppColors.accentRose,
                  child: const Icon(Icons.inventory_2_outlined),
                ),
                selectedIcon: Badge(
                  isLabelVisible: lowStockCount > 0,
                  label: Text(lowStockCount.toString()),
                  backgroundColor: AppColors.accentRose,
                  child: const Icon(Icons.inventory_2_rounded, color: AppColors.primary),
                ),
                label: 'Stok Barang',
              ),
              const NavigationDestination(
                icon: Icon(Icons.analytics_outlined),
                selectedIcon: Icon(Icons.analytics_rounded, color: AppColors.primary),
                label: 'Laporan',
              ),
              const NavigationDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings_rounded, color: AppColors.primary),
                label: 'Toko',
              ),
            ],
          );
        },
      ),
    );
  }
}
