
import React from 'react';
import { Download } from 'lucide-react';
import { VideoSegment } from '../types';

interface SegmentPreviewProps {
  segment: VideoSegment;
  index: number;
}

const SegmentPreview: React.FC<SegmentPreviewProps> = ({ segment, index }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = segment.url;
    link.download = segment.name;
    link.click();
  };

  return (
    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group">
      <div className="aspect-video bg-black relative">
        <video 
          src={segment.url} 
          className="w-full h-full object-contain"
          controlsList="nodownload"
        />
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
          Parte {index + 1}
        </div>
        <div className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {Math.floor(segment.startTime)}s - {Math.floor(segment.endTime)}s
        </div>
      </div>
      <div className="p-3 flex items-center justify-between bg-white">
        <span className="text-xs font-medium text-slate-600 truncate mr-2">
          {segment.name}
        </span>
        <button
          onClick={handleDownload}
          className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
          title="Baixar esta parte"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export default SegmentPreview;
