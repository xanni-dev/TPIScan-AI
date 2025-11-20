import { X, Zap, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import svgPaths from "../imports/svg-p4zz03jfd3";

interface CameraScreenProps {
  onClose?: () => void;
  onCapture?: (imageData: string) => void;
}

export default function CameraScreen({ onClose, onCapture }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, [facingMode]);

  const playShutterSound = () => {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(820, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setHasPermission(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRotateCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const handleFlashToggle = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn } as any]
          });
          setIsFlashOn(!isFlashOn);
        } catch (error) {
          console.log("Flash not supported on this device");
        }
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && onCapture) {
      playShutterSound();
      // Create a canvas to capture the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageData);
      }
    }
  };

  return (
    <div className="bg-white relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto overflow-hidden" data-name="Flow">
      {/* Real-time Video Feed */}
      <div className="absolute inset-0 h-full w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute h-full w-full object-cover animate-fadeIn"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)" }}
        />
        {!hasPermission && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center animate-fadeIn">
            <p className="text-white text-center px-4">Camera access required. Please allow camera permissions.</p>
          </div>
        )}
        <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0.5)] inset-0 to-[rgba(0,0,0,0.5)] via-50% via-[rgba(255,255,255,0)]" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute backdrop-blur-[25px] backdrop-filter bg-[rgba(255,255,255,0.14)] top-4 sm:top-5 right-4 sm:right-5 rounded-full size-10 sm:size-[40px] flex items-center justify-center border border-[rgba(255,255,255,0.2)] z-10 hover:bg-[rgba(255,255,255,0.2)] transition-all active:scale-95 animate-fadeIn"
        style={{ animationDelay: '0.1s' }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Detection Box */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[178px] sm:h-[178px] animate-scaleIn" style={{ animationDelay: '0.2s' }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 181 181">
          <path d={svgPaths.p1121aa8} stroke="white" strokeWidth="3" />
        </svg>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-[50px] sm:bottom-[60px] left-1/2 -translate-x-1/2 flex gap-6 sm:gap-8 items-center justify-center z-10 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
        {/* Flash Button */}
        <button 
          onClick={handleFlashToggle}
          className={`backdrop-blur-[25px] backdrop-filter rounded-full size-12 sm:size-[54px] flex items-center justify-center border transition-colors ${
            isFlashOn 
              ? 'bg-[rgba(255,255,255,0.3)] border-white' 
              : 'bg-[rgba(255,255,255,0.14)] border-[#998d85] hover:bg-[rgba(255,255,255,0.2)]'
          }`}
        >
          <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${isFlashOn ? 'text-yellow-300 fill-yellow-300' : 'text-white'}`} />
        </button>

        {/* Capture Button */}
        <button
          onClick={handleCapture}
          className="relative shrink-0 size-16 sm:size-[74px] hover:scale-105 transition-transform active:scale-95"
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74 74">
            <circle cx="37" cy="37" r="35" stroke="white" strokeWidth="4" />
            <circle cx="37" cy="37" fill="white" r="29.5" stroke="white" />
          </svg>
        </button>

        {/* Flip Button */}
        <button 
          onClick={handleRotateCamera}
          className="backdrop-blur-[25px] backdrop-filter bg-[rgba(255,255,255,0.14)] rounded-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-center border border-[#998d85] hover:bg-[rgba(255,255,255,0.2)] transition-all gap-2 text-white"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm tracking-wide uppercase">Flip</span>
        </button>
      </div>
    </div>
  );
}
