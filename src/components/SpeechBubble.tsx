import React from 'react';

interface SpeechBubbleProps {
  text: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="absolute top-[8%] right-2 sm:right-6 max-w-[210px] sm:max-w-[250px] z-20 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95">
      <div className="relative bg-white text-slate-800 text-xs sm:text-sm font-bold px-3 py-2.5 rounded-2xl border-2 border-sky-400 shadow-lg leading-snug">
        <span>{text}</span>
        {/* Comic Tail pointing down-left towards Montanha */}
        <div className="absolute -bottom-2 left-6 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-sky-400" />
        <div className="absolute -bottom-1.5 left-[25px] w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-white" />
      </div>
    </div>
  );
};
