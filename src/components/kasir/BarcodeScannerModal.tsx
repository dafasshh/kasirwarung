import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, AlertCircle, RefreshCw, Zap, ShieldAlert } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setErrorMsg(null);
    setIsInitializing(true);

    const startScanner = async () => {
      try {
        // Cek dukungan MediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            throw new Error('Akses kamera di browser HP memerlukan koneksi aman HTTPS atau localhost.');
          }
          throw new Error('Browser atau perangkat ini tidak mendukung akses kamera.');
        }

        // Ambil daftar perangkat kamera
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (!devices || devices.length === 0) {
          throw new Error('Kamera tidak ditemukan pada perangkat ini.');
        }

        setCameras(devices);

        // Prioritaskan kamera belakang (environment) untuk HP
        let chosenCameraId = devices[0].id;
        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('belakang') ||
          d.label.toLowerCase().includes('environment')
        );
        if (backCamera) {
          chosenCameraId = backCamera.id;
        }
        setSelectedCameraId(chosenCameraId);

        // Inisialisasi Html5Qrcode instance
        const html5QrCode = new Html5Qrcode('barcode-camera-scanner-view', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });

        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 200 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          chosenCameraId,
          config,
          (decodedText) => {
            if (!isScanningRef.current) return;
            isScanningRef.current = false;

            // Mainkan feedback suara beep pendek jika didukung
            try {
              const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.value = 880;
              gain.gain.value = 0.15;
              osc.start();
              osc.stop(audioCtx.currentTime + 0.12);
            } catch {
              // Ignore audio context restriction
            }

            // Hentikan kamera dan teruskan kode hasil scan
            html5QrCode
              .stop()
              .then(() => {
                html5QrCode.clear();
                onScanSuccess(decodedText);
              })
              .catch(() => {
                onScanSuccess(decodedText);
              });
          },
          () => {
            // Callback scanning frame per detik, dibiarkan silent agar tidak spam log
          }
        );

        if (isMounted) {
          isScanningRef.current = true;
          setIsInitializing(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setIsInitializing(false);
        const errMessage = err instanceof Error ? err.message : String(err);
        if (errMessage.includes('NotAllowedError') || errMessage.includes('Permission denied')) {
          setErrorMsg('Izin akses kamera ditolak. Harap izinkan akses kamera di pengaturan browser Anda.');
        } else if (errMessage.includes('NotFoundError') || errMessage.includes('kamera tidak ditemukan')) {
          setErrorMsg('Tidak ada kamera yang terdeteksi pada perangkat ini.');
        } else if (errMessage.includes('NotReadableError') || errMessage.includes('in use')) {
          setErrorMsg('Kamera sedang digunakan oleh aplikasi lain atau tidak dapat diakses.');
        } else {
          setErrorMsg(errMessage || 'Gagal menyalakan pemindai kamera.');
        }
      }
    };

    startScanner();

    // Cleanup saat unmount atau modal ditutup
    return () => {
      isMounted = false;
      isScanningRef.current = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
            }).catch(() => {});
          } else {
            scannerRef.current.clear();
          }
        } catch {
          // Silent cleanup
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  // Ganti kamera jika ada lebih dari 1 kamera (Depan / Belakang)
  const handleSwitchCamera = async (newCameraId: string) => {
    setSelectedCameraId(newCameraId);
    if (!scannerRef.current) return;

    try {
      setIsInitializing(true);
      setErrorMsg(null);
      isScanningRef.current = false;

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.start(
        newCameraId,
        { fps: 15, qrbox: { width: 260, height: 200 } },
        (decodedText) => {
          if (!isScanningRef.current) return;
          isScanningRef.current = false;
          scannerRef.current?.stop().then(() => {
            scannerRef.current?.clear();
            onScanSuccess(decodedText);
          }).catch(() => {
            onScanSuccess(decodedText);
          });
        },
        () => {}
      );
      isScanningRef.current = true;
      setIsInitializing(false);
    } catch (err: unknown) {
      setIsInitializing(false);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengganti kamera.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-md max-h-[92dvh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header Modal */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Scan Barcode / QR Kamera
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Pindai kode barang ritel via kamera HP atau webcam
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Tutup Pemindai"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-3 sm:p-5 flex flex-col items-center overflow-y-auto flex-1">
          {/* Kamera View Container */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center shrink-0">
            {/* Target Div untuk Html5Qrcode */}
            <div id="barcode-camera-scanner-view" className="w-full h-full object-cover" />

            {/* Loading Overlay */}
            {isInitializing && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-white space-y-2.5 z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs font-semibold">Mengaktifkan kamera...</span>
              </div>
            )}

            {/* Error Overlay */}
            {errorMsg && (
              <div className="absolute inset-0 bg-slate-950/95 p-5 flex flex-col items-center justify-center text-center text-white space-y-3 z-20">
                <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-400">Gagal Mengakses Kamera</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{errorMsg}</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Viewfinder Guideline Overlay */}
            {!isInitializing && !errorMsg && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-44 rounded-2xl border-2 border-blue-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] relative flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* Red Laser Scanning Line Animation */}
                  <div className="w-[90%] h-0.5 bg-rose-500/80 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Petunjuk & Seleksi Kamera */}
          <div className="w-full mt-3.5 space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center space-x-2 text-[11px] text-blue-700 dark:text-blue-300">
              <Zap className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Arahkan barcode produk ke dalam kotak bingkai sampai terbaca otomatis.</span>
            </div>

            {cameras.length > 1 && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Pilih Kamera:</span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => handleSwitchCamera(e.target.value)}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
                >
                  {cameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[42px] text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-98 transition flex items-center justify-center touch-manipulation"
          >
            Tutup Pemindai
          </button>
        </div>
      </div>
    </div>
  );
};
