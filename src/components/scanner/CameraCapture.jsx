import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CameraCapture({ onCapture, onClose, label = "Toma una foto" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      streamRef.current?.getTracks().forEach(track => track.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      streamRef.current = mediaStream;
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, [startCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = async () => {
    setIsUploading(true);
    try {
      const blob = await fetch(capturedImage).then(r => r.blob());
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onCapture(file_url);
    } catch (err) {
      setError('Error al subir la imagen. Intenta de nuevo.');
    }
    setIsUploading(false);
  };

  const handleClose = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={handleClose} className="p-2 rounded-full bg-black/40 text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium text-sm">{label}</span>
        <button
          onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
          className="p-2 rounded-full bg-black/40 text-white"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Camera className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Cámara no disponible</p>
            <p className="text-white/60 text-sm">{error}</p>
            <button onClick={handleClose} className="mt-6 px-6 py-2.5 bg-white text-black rounded-full font-medium">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {!error && !capturedImage && (
        <>
          <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 flex justify-center bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={capture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          </div>
        </>
      )}

      {capturedImage && (
        <>
          <img src={capturedImage} alt="Captura" className="flex-1 object-cover" />
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 flex justify-center gap-8 bg-gradient-to-t from-black/60 to-transparent">
            <button onClick={retake} className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white">
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={confirm}
              disabled={isUploading}
              className="w-14 h-14 rounded-full bg-[#4CAF50] flex items-center justify-center text-white disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-7 h-7" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
