
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  progress: number;
  message: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ progress, message }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="text-indigo-600 animate-spin" size={48} />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-600">
              {Math.round(progress)}%
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Processando Vídeo</h3>
            <p className="text-slate-500 text-sm">{message}</p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Isso pode levar alguns minutos dependendo do tamanho
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
