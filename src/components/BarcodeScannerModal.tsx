import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Barcode Kamera',
}) => {
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');

  useEffect(() => {
    if (!isOpen || mode !== 'camera') return;

    let scanner: Html5QrcodeScanner | null = null;
    const timer = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 180 },
            rememberLastUsedCamera: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner?.clear();
            onScanSuccess(decodedText.trim());
            onClose();
          },
          () => {
            // ignore scan frame errors
          }
        );
      } catch (err) {
        console.warn('Camera scanner fallback:', err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        try {
          scanner.clear();
        } catch {}
      }
    };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 transition-colors animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              {mode === 'camera' ? (
                <Camera className="w-4 h-4 stroke-[2]" />
              ) : (
                <Keyboard className="w-4 h-4 stroke-[2]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">{title}</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {mode === 'camera' ? 'Arahkan kamera ke barcode kemasan' : 'Input nomor barcode secara manual'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col items-center">
          {mode === 'camera' ? (
            <div className="w-full">
              <div
                id="qr-reader"
                className="w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
              />
              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-3 font-normal">
                Arahkan webcam / kamera HP ke barcode kemasan barang ritel.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-3 py-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Nomor Barcode / SKU Barang:
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: 8999999000101"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Contoh siap tes:</span>
                <button
                  type="button"
                  onClick={() => setManualCode('8999999000101')}
                  className="text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono transition-colors"
                >
                  Beras Ramos (8999999000101)
                </button>
                <button
                  type="button"
                  onClick={() => setManualCode('8998866200115')}
                  className="text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono transition-colors"
                >
                  Indomie (8998866200115)
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (manualCode.trim()) {
                    onScanSuccess(manualCode.trim());
                    onClose();
                  }
                }}
                disabled={!manualCode.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-xs disabled:opacity-40 transition-colors text-xs"
              >
                Gunakan Barcode
              </button>
            </div>
          )}
        </div>

        {/* Toggle Mode Footer */}
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Kamera buram atau tidak aktif?</span>
          <button
            type="button"
            onClick={() => setMode(mode === 'camera' ? 'manual' : 'camera')}
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
          >
            {mode === 'camera' ? 'Input Barcode Manual' : 'Buka Kamera Kembali'}
          </button>
        </div>
      </div>
    </div>
  );
};
