
import React, { useState } from 'react';
import { Upload, FileVideo } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
      }`}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
        isDragging ? 'bg-indigo-500 text-white rotate-12' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
      }`}>
        {isDragging ? <Upload size={32} /> : <FileVideo size={32} />}
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-slate-900">Arraste seu vídeo aqui</p>
        <p className="text-slate-500 mt-1">Ou clique para selecionar o arquivo</p>
      </div>
      <div className="mt-2 px-4 py-1.5 bg-slate-100 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-500">
        MP4, WEBM, MOV ou AVI
      </div>
    </div>
  );
};

export default FileUploader;
