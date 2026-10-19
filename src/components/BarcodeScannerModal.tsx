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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {mode === 'camera' ? <Camera className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col items-center">
          {mode === 'camera' ? (
            <div className="w-full">
              <div
                id="qr-reader"
                className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
              ></div>
              <p className="text-xs text-center text-gray-500 mt-3">
                Arahkan webcam / kamera HP ke barcode kemasan barang ritel.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-4 py-2">
              <label className="block text-xs font-semibold text-gray-700">
                Nomor Barcode / SKU Barang:
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: 8999999000101"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-gray-400">Contoh siap tes:</span>
                <button
                  type="button"
                  onClick={() => setManualCode('8999999000101')}
                  className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700 hover:bg-gray-200"
                >
                  Beras Ramos (8999999000101)
                </button>
                <button
                  type="button"
                  onClick={() => setManualCode('8998866200115')}
                  className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700 hover:bg-gray-200"
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
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Gunakan Barcode
              </button>
            </div>
          )}
        </div>

        {/* Toggle Mode Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-500">Kamera bermasalah atau buram?</span>
          <button
            type="button"
            onClick={() => setMode(mode === 'camera' ? 'manual' : 'camera')}
            className="text-primary font-bold hover:underline"
          >
            {mode === 'camera' ? 'Ketik Barcode Manual' : 'Buka Kamera Kembali'}
          </button>
        </div>
      </div>
    </div>
  );
};
