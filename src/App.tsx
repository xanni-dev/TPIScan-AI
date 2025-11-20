import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import UploadScreen from "./components/UploadScreen";
import CameraScreen from "./components/CameraScreen";
import AnalyzingScreen from "./components/AnalyzingScreen";
import ResultsScreen from "./components/ResultsScreen";
import RecentReportsScreen from "./components/RecentReportsScreen";

type Screen = "splash" | "onboarding" | "upload" | "camera" | "analyzing" | "results" | "reports";

export interface Report {
  id: string;
  title: string;
  date: Date;
  imageData: string;
  aiResult?: any;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [currentReportId, setCurrentReportId] = useState<string>("");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // onboarding -> upload
  const handleNext = () => setCurrentScreen("upload");
  const handleOpenCamera = () => { setViewingReport(null); setCurrentScreen("camera"); };
  const handleOpenPhotos = () => {
    setViewingReport(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            handleUpload(result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUpload = (imageData: string) => {
    setCapturedImage(imageData);
    const newId = Date.now().toString();
    setCurrentReportId(newId);
    setAnalysisResult(null);
    setCurrentScreen("analyzing");
  };

  const handleCapture = handleUpload;

  const handleClose = () => setCurrentScreen("reports");

  const handleSave = () => {
    if (!analysisResult) {
      alert("Please wait for the AI analysis to complete before saving.");
      return;
    }

    if (capturedImage) {
      const idToUse = currentReportId || Date.now().toString();
      const newReport: Report = {
        id: idToUse,
        title: "Structural Crack (Shear)",
        date: new Date(),
        imageData: capturedImage,
        aiResult: analysisResult
      };
      const exists = savedReports.some(report => report.id === idToUse);
      if (!exists) {
        setSavedReports(prev => [newReport, ...prev]);
      } else {
        setSavedReports(prev => prev.map(r => r.id === idToUse ? newReport : r));
      }
      setCurrentReportId(idToUse);
    }
    setCurrentScreen("reports");
  };

  const handleShare = async () => {
    if (!capturedImage) return;
    if (navigator.share) {
      try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'tpiscan-analysis.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'TPIScan Analysis Report',
          text: `${analysisResult?.crackType ?? 'Crack'} - ${analysisResult?.severity ?? 'Moderate'} severity`,
          files: [file]
        });
      } catch (err) { console.log('Share failed', err); }
    } else {
      alert("Report link copied to clipboard!");
    }
  };

  const handleReportClick = (report: Report) => {
    setViewingReport(report);
    setCapturedImage(report.imageData);
    setAnalysisResult(report.aiResult ?? null);
    setCurrentReportId(report.id);
    setCurrentScreen("results");
  };

  const handleDeleteReport = (reportId: string) => setSavedReports(prev => prev.filter(r => r.id !== reportId));
  const handleBackToReports = () => { setViewingReport(null); setCurrentScreen("reports"); };

  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => setCurrentScreen("onboarding"), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  return (
    <div className="relative">
      {currentScreen === "splash" && <div className="animate-fadeIn"><SplashScreen /></div>}
      {currentScreen === "onboarding" && <div className="animate-slideInRight"><OnboardingScreen onNext={handleNext} /></div>}
      {currentScreen === "upload" && <div className="animate-slideInRight"><UploadScreen onOpenCamera={handleOpenCamera} onUpload={handleUpload} /></div>}
      {currentScreen === "camera" && <div className="animate-slideInLeft"><CameraScreen onClose={handleClose} onCapture={handleCapture} /></div>}
      {currentScreen === "analyzing" && (
        <div className="animate-fadeIn">
          <AnalyzingScreen
            onClose={handleClose}
            imageData={capturedImage}
            onAnalysisComplete={(result) => {
              if (result) {
                setAnalysisResult(result);
                setCurrentScreen("results");
              } else {
                // Stay on the analyzing screen and let the component show the error
                setAnalysisResult(null);
              }
            }}
          />
        </div>
      )}
      {currentScreen === "results" && (
        <div className="animate-slideInUp">
          <ResultsScreen
            onBack={handleBackToReports}
            imageData={capturedImage}
            aiResult={analysisResult}
            onSave={handleSave}
            onShare={handleShare}
            isSaved={savedReports.some(report => report.id === (viewingReport?.id ?? currentReportId))}
          />
        </div>
      )}
      {currentScreen === "reports" && (
        <div className="animate-slideInLeft">
          <RecentReportsScreen
            reports={savedReports}
            onOpenCamera={handleOpenCamera}
            onOpenPhotos={handleOpenPhotos}
            onReportClick={handleReportClick}
            onDeleteReport={handleDeleteReport}
          />
        </div>
      )}
    </div>
  );
}
