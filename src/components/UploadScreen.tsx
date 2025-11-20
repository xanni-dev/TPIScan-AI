import { Upload } from "lucide-react";
import svgPaths from "../imports/svg-pz1miignsl.ts";

function AIPoweredBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#e3f2fd] border border-[#0088ff] rounded-full">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={svgPaths.paccec40} stroke="#0088FF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-[#0088ff] text-[14px]">AI-Powered Analysis</span>
    </div>
  );
}

interface UploadScreenProps {
  onBack?: () => void;
  onOpenCamera?: () => void;
  onUpload?: (imageData: string) => void;
}

export default function UploadScreen({ onBack, onOpenCamera, onUpload }: UploadScreenProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Read the file and convert to data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (imageData && onUpload) {
          onUpload(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    if (onOpenCamera) {
      onOpenCamera();
    } else {
      console.log("Open camera");
    }
  };

  return (
    <div className="bg-white relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto flex flex-col pb-6" data-name="Flow">
      <div className="flex-1 px-4 sm:px-6 pt-8 sm:pt-12 pb-6 flex flex-col">
        <div className="mb-6 sm:mb-8 animate-fadeIn">
          <AIPoweredBadge />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-[#d1d5db] rounded-[12px] p-8 sm:p-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#0088ff] transition-all w-full min-h-[200px] sm:min-h-[250px] animate-scaleIn"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="bg-[#f8f8f8] rounded-full p-3 sm:p-4">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#6b7280]" />
            </div>
            <div className="text-center">
              <p className="text-[#1e1e1e] mb-1">Upload photo</p>
              <p className="text-[#6b7280] text-[13px] sm:text-[14px]">PNG, JPG</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={handleCameraClick}
            className="bg-[#1e1e1e] text-white rounded-[12px] py-3 sm:py-4 px-6 w-full mt-6 transition-all hover:opacity-90 active:scale-98 flex items-center justify-center animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            Open camera
          </button>
        </div>

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 flex-wrap text-[11px] sm:text-[12px] text-[#9ca3af] animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <span>Minimal</span>
          <span>•</span>
          <span>Private</span>
          <span>•</span>
          <span>Non-destructive</span>
        </div>

        <div className="mt-2 text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <a href="#" className="text-[#9ca3af] text-[11px] sm:text-[12px] underline hover:text-[#6b7280] transition-colors">
            Privacy first
          </a>
        </div>
      </div>
    </div>
  );
}
