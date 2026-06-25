import React from 'react';

const TOAST_TYPES = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    iconBg: 'bg-green-100 text-green-500',
    ring: 'focus:ring-green-400 hover:bg-green-200',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    iconBg: 'bg-red-100 text-red-500',
    ring: 'focus:ring-red-400 hover:bg-red-200',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    iconBg: 'bg-blue-100 text-blue-500',
    ring: 'focus:ring-blue-400 hover:bg-blue-200',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    iconBg: 'bg-amber-100 text-amber-500',
    ring: 'focus:ring-amber-400 hover:bg-amber-200',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  }
};

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const style = TOAST_TYPES[type] || TOAST_TYPES.success;

  return (
    <div className={`fixed top-4 right-4 z-50 flex w-full max-w-sm items-center space-x-3 rounded-lg border p-4 shadow-lg animate-fade-in ${style.bg}`} role="alert">
      {/* Dynamic Status Icon */}
      <div className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg ${style.iconBg}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          {style.icon}
        </svg>
      </div>

      {/* Message Body */}
      <div className={`flex-1 text-sm font-medium ${style.text}`}>
        {message}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        type="button" 
        className={`flex-shrink-0 ml-auto -mx-1.5 -my-1.5 inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 p-1.5 transition-colors focus:outline-none focus:ring-2 ${style.ring}`}
        aria-label="Close"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
    </div>
  );
}
