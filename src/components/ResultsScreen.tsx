// src/components/ResultsScreen.tsx
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import svgPaths from "../imports/svg-8s7slh16m8";
import { ImageWithFallback } from './figma/ImageWithFallback';

function BulletPoint({ text }: { text: string }) {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-start relative shrink-0">
      <div className="relative shrink-0 size-[4px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="#1E1E1E" r="2" />
        </svg>
      </div>
      <p className="font-['SF_Pro_Display',sans-serif] leading-[normal] not-italic relative text-[#1e1e1e] text-[12px]">{text}</p>
    </div>
  );
}

interface AiResult {
  severity?: string;
  crackType?: string;
  confidence?: number;
  description?: string;
  dimensions?: {
    length?: string;
    width?: string;
    depth?: string;
  };
  recommendedActions?: {
    shortTerm?: string[];
    longTerm?: string[];
  };
  urgency?: {
    level?: string;
    timeline?: string;
  };
}

/*interface ResultsScreenProps {
  onBack?: () => void;
  imageData?: string;
  aiResult: AiResult | null; // <- pass AI result here
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
}*/

interface ResultsScreenProps {
  onBack: () => void;
  imageData: string | null;
  aiResult: any;   // <--- critical
  onSave: () => void;
  onShare: () => void;
  isSaved: boolean;
}


export default function ResultsScreen({ onBack, imageData, aiResult, onSave, onShare, isSaved }: ResultsScreenProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShare = async () => {
    if (!imageData) return;
    if (onShare) onShare();

    if (navigator.share) {
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'tpiscan-analysis.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'TPIScan Analysis Report',
          text: `${aiResult?.crackType} - ${aiResult?.severity} severity. Confidence: ${Math.round((aiResult?.confidence ?? 0) * 100)}%`,
          files: [file]
        });
      } catch (err) { console.log('Share failed', err); }
    }
  };

  if (!imageData) {
    return (
      <div className="bg-gray-50 relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-[#8e8e8e] text-[15px]">No image to analyze</p>
          <button onClick={onBack} className="mt-4 text-[#0088ff] text-[14px]">Go back</button>
        </div>
      </div>
    );
  }

  // Use AI result if available, otherwise show message
  const hasAiResult = aiResult && (
    aiResult.severity || 
    aiResult.crackType || 
    aiResult.confidence || 
    aiResult.description
  );

  return (
    <div className="bg-gray-50 relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto overflow-y-auto pb-[100px]">
      {/* Fixed Top Header */}
      <div className={`fixed bg-white h-[130px] left-0 right-0 max-w-md mx-auto shadow-[0px_4px_14px_0px_rgba(30,30,30,0.03)] top-0 z-10 ${isMounted ? 'animate-slideDown' : ''}`}>
        <div className="absolute left-[20px] right-[20px] top-[83px] flex items-center gap-[16px]">
          <button onClick={onBack} className="size-[24px] hover:opacity-70 transition-opacity flex-shrink-0">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p8f46d40} stroke="#141B34" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </button>
          <p className="font-['SF_Pro_Display',sans-serif] leading-[24px] not-italic text-[#1e1e1e] text-[20px] text-nowrap tracking-[-0.165px]">AI-Analysis</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-[130px]">
        {/* Image Section */}
        <div className={`h-[344px] w-full overflow-clip ${isMounted ? 'animate-fadeIn' : ''}`}>
          <ImageWithFallback alt="Analyzed crack" className="h-full w-full object-cover" src={imageData} />
        </div>

        {/* Badges */}
        <div className={`bg-white shadow-[0px_4px_14px_0px_rgba(30,30,30,0.03)] px-[20px] py-[20px] mt-[-40px] ${isMounted ? 'animate-slideInUp' : ''}`} style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col gap-[8px]">
            {/* Severity */}
            <div className="bg-[#fef9c2] inline-flex items-center justify-center px-[12px] py-[8px] rounded-[50px] w-max">
              <p className="text-[#6f6606] text-[12px]">
                {hasAiResult && aiResult?.severity ? aiResult.severity : 'Moderate'}
              </p>
            </div>
            {/* Crack type + confidence */}
            <div className="flex gap-[8px] flex-wrap">
              <div className="bg-[#ffc39b] inline-flex items-center justify-center px-[12px] py-[8px] rounded-[50px] w-max">
                <p className="text-[#633402] text-[14px]">
                  {hasAiResult && aiResult?.crackType ? aiResult.crackType : 'Structural Crack (Shear)'}
                </p>
              </div>
              <div className="bg-[#f59f0a] flex items-center gap-[4px] px-[12px] py-[8px] rounded-[50px] w-max">
                <p className="text-[#855604] text-[14px]">Confidence</p>
                <div className="size-[4px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
                    <circle cx="2" cy="2" fill="#855604" r="2" />
                  </svg>
                </div>
                <p className="text-[#503300] text-[14px]">
                  {Math.round((hasAiResult && aiResult?.confidence ? aiResult.confidence : 0.50) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={`px-[20px] pt-[12px] ${isMounted ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="bg-[#e6f4ff] p-[20px] rounded-[12px]">
            <p className="text-[#1e1e1e] text-[14px]">
              {hasAiResult && aiResult?.description 
                ? aiResult.description 
                : 'AI analysis is being processed. Please wait or try again.'}
            </p>
          </div>
        </div>

        {/* Dimensions */}
        <div className={`px-[20px] pt-[12px] flex flex-col gap-[12px] ${isMounted ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.3s' }}>
          <div className="bg-white px-[14px] py-[16px] rounded-[12px] relative">
            <div aria-hidden className="absolute border border-[#e1e1e1] inset-0 rounded-[12px]" />
            <p className="text-[#8e8e8e] text-[12px]">Dimension</p>
            <div className="flex flex-col gap-[8px] mt-[8px]">
              <BulletPoint text={`Length - ${hasAiResult && aiResult?.dimensions?.length ? aiResult.dimensions.length : '45cm'}`} />
              <BulletPoint text={`Width - ${hasAiResult && aiResult?.dimensions?.width ? aiResult.dimensions.width : '2-3mm'}`} />
              <BulletPoint text={`Depth - ${hasAiResult && aiResult?.dimensions?.depth ? aiResult.dimensions.depth : '5-8mm'}`} />
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className={`px-[20px] pt-[12px] flex flex-col gap-[12px] ${isMounted ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.4s' }}>
          {/* Short-term */}
          <div className="bg-white px-[14px] py-[16px] rounded-[12px] relative">
            <div aria-hidden className="absolute border border-[#e1e1e1] inset-0 rounded-[12px]" />
            <p className="text-[#8e8e8e] text-[12px]">Short-term (1-2 weeks)</p>
            <div className="flex flex-col gap-[8px] mt-[8px]">
              {hasAiResult && aiResult?.recommendedActions?.shortTerm && aiResult.recommendedActions.shortTerm.length > 0
                ? aiResult.recommendedActions.shortTerm.map((a: string, i: number) => <BulletPoint key={i} text={a} />)
                : [
                    <BulletPoint key="1" text="Mark and monitor crack length and width weekly" />,
                    <BulletPoint key="2" text="Limit use of affected area until inspected" />
                  ]
              }
            </div>
          </div>

          {/* Long-term */}
          <div className="bg-white px-[14px] py-[16px] rounded-[12px] relative">
            <div aria-hidden className="absolute border border-[#e1e1e1] inset-0 rounded-[12px]" />
            <p className="text-[#8e8e8e] text-[12px]">Long-term</p>
            <div className="flex flex-col gap-[8px] mt-[8px]">
              {hasAiResult && aiResult?.recommendedActions?.longTerm && aiResult.recommendedActions.longTerm.length > 0
                ? aiResult.recommendedActions.longTerm.map((a: string, i: number) => <BulletPoint key={i} text={a} />)
                : [
                    <BulletPoint key="1" text="Seal the crack with appropriate epoxy filler" />,
                    <BulletPoint key="2" text="Engage a structural engineer for on-site assessment" />,
                    <BulletPoint key="3" text="Check for water infiltration behind the crack" />
                  ]
              }
            </div>
          </div>
        </div>

        {/* Urgency */}
        <div className={`px-[20px] pt-[12px] ${isMounted ? 'animate-fadeIn' : ''}`} style={{ animationDelay: '0.5s' }}>
          <div className="bg-white px-[20px] py-[20px] rounded-[12px] relative mt-[8px] border border-[rgba(245,159,10,0.1)]">
            <p className="text-[#1e1e1e] text-[14px]">
              Urgency: <span className="text-[#f59f0a]">
                {hasAiResult && aiResult?.urgency?.level 
                  ? `${aiResult.urgency.level} - Address within ${aiResult.urgency.timeline ?? '1-2 weeks'}` 
                  : 'Moderate - Address within 1-2 weeks'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className={`fixed left-0 right-0 bg-white/95 px-[20px] pt-[18px] pb-[24px] max-w-md mx-auto border-t border-gray-100 z-20 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] ${isMounted ? 'animate-slideInUp' : ''}`}
        style={{ animationDelay: '0.6s', bottom: '16px', borderRadius: '24px 24px 0 0' }}
      >
        <div className="bg-[#f5f6fb] rounded-2xl p-3 flex gap-[12px]">
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`flex-1 px-[52px] py-[18px] rounded-[12px] text-base font-medium ${isSaved ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-[#0088ff]/20 text-[#0088ff] hover:bg-[#e3f2fd] active:scale-98 transition-all'}`}
          >
            {isSaved ? 'Saved' : 'Save report'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-[#0088ff] px-[52px] py-[18px] rounded-[12px] text-white text-base font-medium hover:bg-[#0077dd] active:scale-98 transition-all"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
