
import React from 'react';
import { SplitDuration } from '../types';

interface DurationSelectorProps {
  selected: SplitDuration;
  onSelect: (duration: SplitDuration) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ selected, onSelect }) => {
  const options: { value: SplitDuration; label: string; desc: string }[] = [
    { value: 15, label: '15 Segundos', desc: 'Stories e Reels Curtos' },
    { value: 30, label: '30 Segundos', desc: 'WhatsApp Status e Reels' },
    { value: 60, label: '60 Segundos', desc: 'TikTok e Vídeos Longos' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Escolha a duração de cada parte</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              selected === opt.value
                ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 font-bold text-sm ${
              selected === opt.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {opt.value}
            </div>
            <p className="font-bold text-slate-900">{opt.label}</p>
            <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationSelector;
