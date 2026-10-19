import 'dart:async';
import 'package:flutter/foundation.dart';
import '../database/database_helper.dart';

enum SyncStatus { idle, syncing, completed, offline, error }

class SyncReport {
  final int pendingCount;
  final SyncStatus status;
  final String? lastSyncTime;
  final String? message;

  const SyncReport({
    this.pendingCount = 0,
    this.status = SyncStatus.idle,
    this.lastSyncTime,
    this.message,
  });
}

class SyncService {
  static final SyncService instance = SyncService._internal();
  SyncService._internal();

  final _syncController = StreamController<SyncReport>.broadcast();
  Stream<SyncReport> get syncStream => _syncController.stream;

  SyncReport _currentReport = const SyncReport();
  SyncReport get currentReport => _currentReport;

  /// Check pending sync items in queue
  Future<int> getPendingCount() async {
    try {
      final db = await DatabaseHelper.instance.database;
      final result = await db.rawQuery(
        "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING'",
      );
      final count = Sqflite.firstIntValue(result) ?? 0;
      _updateReport(_currentReport.status, count: count);
      return count;
    } catch (_) {
      return 0;
    }
  }

  /// Trigger background sync process
  Future<bool> synchronize() async {
    _updateReport(SyncStatus.syncing, message: 'Sedang menyinkronkan data ke Cloud...');

    try {
      final db = await DatabaseHelper.instance.database;
      final pendingItems = await db.query(
        'sync_queue',
        where: "status = 'PENDING'",
        limit: 50,
      );

      if (pendingItems.isEmpty) {
        _updateReport(
          SyncStatus.completed,
          count: 0,
          message: 'Semua data telah tersinkronisasi',
        );
        return true;
      }

      // Simulate network sync to cloud (Supabase/Firebase)
      await Future.delayed(const Duration(milliseconds: 1200));

      // Batch mark as SYNCED
      final now = DateTime.now().toString().substring(0, 16);
      for (final item in pendingItems) {
        final id = item['id'];
        await db.update(
          'sync_queue',
          {'status': 'SYNCED'},
          where: 'id = ?',
          whereArgs: [id],
        );

        if (item['entity_type'] == 'transaction') {
          await db.update(
            'transactions',
            {'is_synced': 1},
            where: 'id = ?',
            whereArgs: [item['entity_id']],
          );
        }
      }

      final remaining = await getPendingCount();
      _updateReport(
        SyncStatus.completed,
        count: remaining,
        lastSync: now,
        message: 'Sinkronisasi berhasil ($now)',
      );
      return true;
    } catch (e) {
      debugPrint('Sync failed: $e');
      _updateReport(
        SyncStatus.error,
        message: 'Koneksi terputus. Data aman tersimpan di HP.',
      );
      return false;
    }
  }

  void _updateReport(SyncStatus status, {int? count, String? lastSync, String? message}) {
    _currentReport = SyncReport(
      status: status,
      pendingCount: count ?? _currentReport.pendingCount,
      lastSyncTime: lastSync ?? _currentReport.lastSyncTime,
      message: message ?? _currentReport.message,
    );
    _syncController.add(_currentReport);
  }

  void dispose() {
    _syncController.close();
  }
}
