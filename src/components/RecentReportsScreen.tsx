import { Camera, Image, MoreVertical } from "lucide-react";
import { useState } from "react";

export interface Report {
  id: string;
  title: string;
  date: Date;
  imageData: string;
}

interface RecentReportsScreenProps {
  reports: Report[];
  onOpenCamera?: () => void;
  onOpenPhotos?: () => void;
  onReportClick?: (report: Report) => void;
  onDeleteReport?: (reportId: string) => void;
}

export default function RecentReportsScreen({ 
  reports, 
  onOpenCamera, 
  onOpenPhotos, 
  onReportClick,
  onDeleteReport 
}: RecentReportsScreenProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInDays < 2) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleMoreClick = (report: Report, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (selectedReport && onDeleteReport) {
      onDeleteReport(selectedReport.id);
    }
    setShowDeleteDialog(false);
    setSelectedReport(null);
  };

  const handleCancel = () => {
    setShowDeleteDialog(false);
    setSelectedReport(null);
  };

  return (
    <div className="bg-gray-50 relative shadow-[0px_12px_44px_0px_rgba(115,115,115,0.05)] w-full min-h-screen max-w-md mx-auto flex flex-col" data-name="Flow">
      {/* Overlay when delete dialog is shown */}
      {showDeleteDialog && (
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.3)] z-20 animate-fadeIn backdrop-blur-sm" onClick={handleCancel} />
      )}

      {/* Content */}
      <div className="flex-1 px-4 sm:px-5 pt-12 sm:pt-[88px] pb-[100px] overflow-y-auto">
        <h1 className="text-[#1e1e1e] text-[18px] sm:text-[20px] mb-6 sm:mb-8">Recent reports</h1>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 px-4 animate-fadeIn">
            <div className="text-center">
              <p className="text-[#8e8e8e] text-[15px] mb-2">No reports yet</p>
              <p className="text-[#8e8e8e] text-[13px]">Start by taking a photo or uploading an image</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {reports.map((report, index) => (
              <div
                key={report.id}
                className="bg-white rounded-[12px] p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all active:scale-98 animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onReportClick?.(report)}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-[#1e1e1e] text-[14px] sm:text-[15px]">{report.title}</p>
                  <p className="text-[#8e8e8e] text-[11px] sm:text-[12px]">{formatDate(report.date)}</p>
                </div>
                <button
                  onClick={(e) => handleMoreClick(report, e)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-[#8e8e8e]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[330px] z-30 animate-scaleIn">
          <div className="bg-white rounded-[20px] p-5 sm:p-6 shadow-[0px_8px_32px_0px_rgba(0,0,0,0.15)]">
            <h2 className="text-[#1e1e1e] text-[16px] sm:text-[17px] mb-2">Delete report?</h2>
            <p className="text-[#8e8e8e] text-[13px] sm:text-[14px] mb-6">
              This report will be deleted from your recent report.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="text-[#1e1e1e] text-[14px] sm:text-[15px] px-5 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="text-[#ff3b30] text-[14px] sm:text-[15px] px-5 py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 sm:px-5 pt-4 pb-6 flex gap-4 items-center justify-center max-w-md mx-auto border-t border-gray-100">
        <button
          onClick={onOpenCamera}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Camera className="w-5 h-5 text-[#1e1e1e]" />
          <span className="text-[#1e1e1e] text-[14px] sm:text-[15px]">Camera</span>
        </button>
        <button
          onClick={onOpenPhotos}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Image className="w-5 h-5 text-[#1e1e1e]" />
          <span className="text-[#1e1e1e] text-[14px] sm:text-[15px]">Photos</span>
        </button>
      </div>
    </div>
  );
}
