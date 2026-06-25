import React from 'react';

export default function Status({ status }) {
  return (
    // Removed max-h constraint and kept simple alignment classes
    <div className="flex items-center justify-end">
      
      {/* Interactive Button Container - Adjusted px and py for smaller height */}
      <button 
        disabled
        className="relative inline-flex items-center justify-center px-4 py-1 bg-slate-900 hover:bg-slate-850 text-slate-100 font-semibold tracking-wide rounded-md shadow-xl border border-slate-800/80 transition-colors overflow-hidden group cursor-wait"
      >
        
        {/* The Animated Border Line Overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-md">
          <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_40%,#6366f1_50%,transparent_60%)] animate-spin" />
        </div>

        {/* Inner Mask: Adjusted inset to 1px for thinner borders on a smaller button */}
        <div className="absolute inset-[1px] bg-slate-900 rounded-[5px] transition-colors group-hover:bg-slate-850" />

        {/* Button Content Layer */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Pulsing Status Dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          
          {/* Main Status Text - Swapped to text-xs for compact layout */}
          <span className="text-xs font-medium text-indigo-100 tracking-wider">
            {status}...
          </span>
        </div>
        
      </button>

    </div>
  );
}


