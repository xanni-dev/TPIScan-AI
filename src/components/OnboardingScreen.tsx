import svgPaths from "../imports/svg-6x0z9stugn.ts";

function FeatureCard({ icon, title, description, bgColor }: { icon: React.ReactNode; title: string; description: string; bgColor: string }) {
  return (
    <div className="bg-[#f8f8f8] rounded-[12px] p-4 flex gap-4 items-start w-full">
      <div className={`${bgColor} rounded-[12px] p-3 flex-shrink-0 w-12 h-12 flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-[#1e1e1e]">{title}</h3>
        <p className="text-[#6b7280] text-[14px]">{description}</p>
      </div>
    </div>
  );
}

function InstantDetectionIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={svgPaths.p30bdd100} stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" />
      <path d={svgPaths.p5250580} stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SeverityAssessmentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={svgPaths.p30bdd100} stroke="#0088FF" strokeWidth="1.5" strokeLinecap="round" />
      <path d={svgPaths.p5250580} stroke="#0088FF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ActionPlansIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={svgPaths.p30bdd100} stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" />
      <path d={svgPaths.p5250580} stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface OnboardingScreenProps {
  onNext: () => void;
}

export default function OnboardingScreen({ onNext }: OnboardingScreenProps) {
  return (
    <div className="bg-white relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto flex flex-col pb-6" data-name="Flow">
      <div className="flex-1 px-4 sm:px-6 pt-8 sm:pt-12 pb-6 flex flex-col">
        <div className="mb-6 sm:mb-8 animate-fadeIn">
          <h1 className="text-[#1e1e1e] mb-2 text-[24px] sm:text-[28px]">
            <span className="text-[#0088ff]">TPI</span>
            <span className="text-[rgba(190,190,190,0.9)]">Scan</span>
          </h1>
          <p className="text-[#6b7280] text-[13px] sm:text-[14px] leading-[1.5]">
            Scan or upload a photo of a crack and get instant, AI-assisted assessment with clear next steps.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <FeatureCard
              icon={<InstantDetectionIcon />}
              title="Instant Detection"
              description="AI identifies crack patterns and structural concerns in seconds."
              bgColor="bg-[#fff4e6]"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <FeatureCard
              icon={<SeverityAssessmentIcon />}
              title="Severity Assessment"
              description="Accurate severity ratings with confidence scores."
              bgColor="bg-[#e3f2fd]"
            />
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <FeatureCard
              icon={<ActionPlansIcon />}
              title="Action Plans"
              description="Clear recommendations and repair timelines."
              bgColor="bg-[#e8f5e9]"
            />
          </div>
        </div>

        <button
          onClick={onNext}
          className="bg-[#1e1e1e] text-white rounded-[12px] py-3 sm:py-4 px-6 w-full mt-6 sm:mt-8 transition-all hover:opacity-90 active:scale-98 flex items-center justify-center animate-fadeIn"
          style={{ animationDelay: '0.4s' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
