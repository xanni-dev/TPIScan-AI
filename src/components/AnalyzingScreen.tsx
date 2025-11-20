import { useEffect, useState } from "react";
import { X, Loader } from "lucide-react";

interface AnalyzingScreenProps {
  onClose?: () => void;
  imageData?: string;
  onAnalysisComplete?: (result: any) => void; // callback to send data to ResultsScreen
}

export default function AnalyzingScreen({ onClose, imageData, onAnalysisComplete }: AnalyzingScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCrackResult = (result: any) => {
    if (!result) return false;
    const raw = JSON.stringify(result).toLowerCase();
    return raw.includes("crack");
  };

  useEffect(() => {
    if (!imageData) return;

    let cancelled = false;

    const analyzeImage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: imageData })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();

        if (!cancelled) {
          if (!isCrackResult(result)) {
            setError("This photo doesn't appear to contain a crack. Please snap or upload a clearer crack image.");
            onAnalysisComplete?.(null);
            return;
          }

          if (onAnalysisComplete) {
            onAnalysisComplete(result);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          // Provide more specific error messages
          if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
            setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:5000');
          } else {
            setError(err?.message ?? 'AI Analysis failed. Please try again.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    analyzeImage();

    return () => { cancelled = true; };
  }, [imageData, onAnalysisComplete]);

  const handleRetry = async () => {
    if (!imageData) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      if (!isCrackResult(result)) {
        setError("This photo doesn't appear to contain a crack. Please snap or upload a clearer crack image.");
        onAnalysisComplete?.(null);
        return;
      }

      if (onAnalysisComplete) onAnalysisComplete(result);
    } catch (err: any) {
      // Provide more specific error messages
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:5000');
      } else {
        setError(err?.message ?? 'AI Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto flex flex-col pb-6">
      <div className="flex-1 px-4 sm:px-5 pt-20 sm:pt-[104px] pb-6 flex flex-col items-center">
        {/* Analyzing Image Card */}
        <div className="relative w-full max-w-[353px] h-[300px] sm:h-[344px] overflow-clip rounded-[24px] sm:rounded-[30px] shadow-[0px_14px_28px_0px_rgba(127,149,166,0.35)] mb-8">
          <div className="absolute inset-0 rounded-[24px] sm:rounded-[30px]">
            <div className="absolute inset-0 overflow-hidden rounded-[24px] sm:rounded-[30px]">
              {imageData ? (
                // ensure image has alt and src string
                <img alt="Analyzing crack" className="absolute h-full w-full object-cover" src={imageData} />
              ) : (
                <div className="absolute h-full w-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image</p>
                </div>
              )}
            </div>
            <div className="absolute bg-gradient-to-b from-[rgba(0,136,255,0.2)] inset-0 rounded-[24px] sm:rounded-[30px] to-[rgba(0,136,255,0.2)] via-50% via-[rgba(255,255,255,0)]" />
          </div>
          {/* Scanning Line Effect */}
          <div className="absolute bg-[#0088ff] blur-md filter h-[20px] left-1/2 top-1/2 w-full animate-scanLine" style={{ 
            boxShadow: '0 0 20px rgba(0, 136, 255, 0.6)'
          }} />
        </div>

        {/* Ghost Loading Lines */}
        <div className="flex flex-col gap-4 sm:gap-[17px] w-full max-w-[279px] mb-8">
          <div className="bg-neutral-100 h-[20px] sm:h-[24px] rounded-[30px] w-full animate-pulse" />
          <div className="bg-neutral-100 h-[20px] sm:h-[24px] rounded-[30px] w-[55%] animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="bg-neutral-100 h-[20px] sm:h-[24px] rounded-[30px] w-[73%] animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="bg-neutral-100 h-[20px] sm:h-[24px] rounded-[30px] w-[41%] animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* Analyzing Status */}
        <div className="bg-[rgba(0,136,255,0.1)] rounded-[16px] px-8 sm:px-[123px] py-3 sm:py-[14px] flex items-center gap-2 mb-8">
          <Loader className="w-5 h-5 text-[#1e1e1e] animate-spin" />
          <p className="text-[#1e1e1e] text-[15px] sm:text-[16px]">Analyzing...</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose?.()}
          className="bg-neutral-100 rounded-full p-3 sm:p-[14px] hover:bg-neutral-200 transition-colors active:scale-95"
        >
          <X className="w-5 h-5 text-[#1e1e1e]" />
        </button>
      </div>
      {/* Error message */}
      {error && (
        <div className="px-4 sm:px-5 animate-slideDown">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-lg flex flex-col gap-2">
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Analysis Error</p>
              <p className="text-red-500 text-xs">{error}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRetry}
                className="text-red-600 text-xs underline hover:text-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Retry analysis
              </button>
              <button
                onClick={() => onClose?.()}
                className="text-red-600 text-xs underline hover:text-red-700 transition-colors"
              >
                Choose another photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
