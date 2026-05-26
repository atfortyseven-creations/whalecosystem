import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSecureCameraOptions {
  facingMode?: 'user' | 'environment';
  onFrame?: (canvas: HTMLCanvasElement) => void;
}

export function useSecureCamera({ facingMode = 'user', onFrame }: UseSecureCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRafId = useRef<number>(0);
  const activeRequestRef = useRef<string | null>(null);

  const startCamera = useCallback(async () => {
    if (isInitializing) return;
    setIsInitializing(true);
    setError(null);
    const activeRequestId = Math.random().toString();
    activeRequestRef.current = activeRequestId;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC API not supported in this browser.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        try {
          // Fallback 1: less strict width/height constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } },
            audio: false,
          });
        } catch (err2) {
          // Fallback 2: Any available video device
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (activeRequestRef.current !== activeRequestId) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true'); // Critical for iOS PWA/Safari
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
          video.play().catch(e => {
            console.error("Video play error:", e);
            setTimeout(() => {
              video.play().catch(() => {});
            }, 300);
          });
        };
      }
    } catch (err: any) {
      if (activeRequestRef.current === activeRequestId) {
        console.error('Camera initialization failed:', err);
        setHasPermission(false);
        setError(err.message || 'Camera access denied or unavailable.');
      }
    } finally {
      if (activeRequestRef.current === activeRequestId) {
        setIsInitializing(false);
      }
    }
  }, [facingMode, isInitializing]);

  const stopCamera = useCallback(() => {
    activeRequestRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(frameRafId.current);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85); // High quality JPEG
    }
    return null;
  }, []);

  // Frame processing loop for intelligent overlay/tracking
  useEffect(() => {
    if (!onFrame || !hasPermission || !videoRef.current || !canvasRef.current) return;

    const processFrame = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          onFrame(canvas);
        }
      }
      frameRafId.current = requestAnimationFrame(processFrame);
    };

    frameRafId.current = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(frameRafId.current);
  }, [onFrame, hasPermission]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    hasPermission,
    isInitializing,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
}
