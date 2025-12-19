
import React, { useState } from 'react';
import { Download, Scissors, FileVideo, CheckCircle, AlertCircle, RefreshCw, Archive, Clock } from 'lucide-react';
import { VideoSegment, SplitDuration, ProcessingState } from './types.ts';
import FileUploader from './components/FileUploader.tsx';
import DurationSelector from './components/DurationSelector.tsx';
import SegmentPreview from './components/SegmentPreview.tsx';
import ProcessingOverlay from './components/ProcessingOverlay.tsx';
import { processVideo } from './services/videoProcessor.ts';

const IconArchive = () => <Archive size={20} />;

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<SplitDuration>(15);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    message: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setSegments([]);
    setError(null);
  };

  const handleReset = () => {
    segments.forEach(seg => URL.revokeObjectURL(seg.url));
    setFile(null);
    setSegments([]);
    setProcessing({ isProcessing: false, progress: 0, message: '' });
    setError(null);
  };

  const handleStartProcess = async () => {
    if (!file) return;

    setProcessing({ isProcessing: true, progress: 0, message: 'Iniciando gravação...' });
    setError(null);

    try {
      const result = await processVideo(file, duration, (progress, message) => {
        setProcessing(prev => ({ ...prev, progress, message }));
      });
      setSegments(result);
      setProcessing({ isProcessing: false, progress: 100, message: 'Concluído!' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao recortar o vídeo. Verifique se o formato é suportado pelo seu navegador.');
      setProcessing({ isProcessing: false, progress: 0, message: '' });
    }
  };

  const downloadZip = async () => {
    if (segments.length === 0) return;
    
    // @ts-ignore - JSZip is loaded via CDN in index.html
    const zip = new window.JSZip();
    segments.forEach((seg) => {
      zip.file(seg.name, seg.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-cut_${duration}s.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <Scissors className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Smart-Cut
            </h1>
          </div>
          {file && !processing.isProcessing && (
            <button 
              onClick={handleReset}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} />
              Recomeçar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!file ? (
          <div className="space-y-6 text-center animate-in fade-in duration-700">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Corte vídeos longos com inteligência.
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                A ferramenta definitiva para Criadores de Conteúdo. Divida seus vídeos para Stories, Reels e TikTok em segundos.
              </p>
            </div>
            <FileUploader onFileSelect={handleFileSelect} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <FileVideo className="text-indigo-600" size={20} />
                </div>
                <h3 className="font-semibold mb-2">Sem Servidores</h3>
                <p className="text-sm text-slate-500">Privacidade garantida. O processamento ocorre 100% no seu computador.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Scissors className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold mb-2">Recorte Preciso</h3>
                <p className="text-sm text-slate-500">Divida com perfeição em intervalos de 15, 30 ou 60 segundos.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Archive className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold mb-2">Download em ZIP</h3>
                <p className="text-sm text-slate-500">Gere todas as partes e baixe um único arquivo organizado.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <FileVideo className="text-indigo-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{file.name}</h3>
                  <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Smart-Cut está pronto</p>
                </div>
              </div>

              {segments.length === 0 ? (
                <div className="space-y-8">
                  <DurationSelector selected={duration} onSelect={setDuration} />
                  
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-amber-800 text-sm">
                    <Clock size={18} className="mt-0.5 shrink-0" />
                    <p>
                      <strong>Como funciona:</strong> O Smart-Cut grava cada segmento individualmente para garantir a compatibilidade. 
                      O tempo total dependerá do tamanho do seu vídeo original.
                    </p>
                  </div>

                  <button
                    onClick={handleStartProcess}
                    disabled={processing.isProcessing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                  >
                    <Scissors size={20} />
                    Processar com Smart-Cut
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <CheckCircle size={20} />
                      Vídeo dividido em {segments.length} partes
                    </div>
                    <button
                      onClick={downloadZip}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                      <IconArchive />
                      Baixar ZIP Completo
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {segments.map((seg, idx) => (
                      <SegmentPreview key={seg.id} segment={seg} index={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </main>

      {processing.isProcessing && (
        <ProcessingOverlay 
          progress={processing.progress} 
          message={processing.message} 
        />
      )}

      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 py-4 hidden sm:block">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-400">
          Tecnologia Smart-Cut • MediaRecorder Native API • v1.3
        </div>
      </footer>
    </div>
  );
};

export default App;
