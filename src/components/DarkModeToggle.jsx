/**
 * DarkModeToggle.jsx
 * Toggles dark mode by adding/removing the 'dark' class on <html>.
 * State persisted in localStorage.
 * Smooth 200ms transition defined in global CSS.
 */
import React from 'react';

export function DarkModeToggle({ isDark, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="
        relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        focus:ring-offset-white dark:focus:ring-offset-slate-800
        min-w-[44px] min-h-[44px] justify-center
      "
            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        >
            {isDark ? (
                /* Sun icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400 transition-transform duration-200 hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.73 0-.7-.7M6.34 6.34l-.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z" />
                </svg>
            ) : (
                /* Moon icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform duration-200 hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}
