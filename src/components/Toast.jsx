/**
 * Toast.jsx + ToastContainer.jsx
 * Custom toast notification system — zero browser alerts.
 * - Bottom-right corner
 * - Slide-in animation
 * - Auto-dismiss (3s default, 5s for undo)
 * - Variants: success / error / info / undo
 * - Undo button for reversible actions
 */
import React from 'react';

// ── Single Toast ──────────────────────────────────────────────────
const variantConfig = {
    success: {
        bg: 'bg-emerald-500',
        dark: 'dark:bg-emerald-600',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        ),
    },
    error: {
        bg: 'bg-red-500',
        dark: 'dark:bg-red-600',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        ),
    },
    info: {
        bg: 'bg-blue-500',
        dark: 'dark:bg-blue-600',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        ),
    },
    undo: {
        bg: 'bg-slate-700',
        dark: 'dark:bg-slate-600',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
        ),
    },
};

export function Toast({ toast, onDismiss }) {
    const config = variantConfig[toast.variant] || variantConfig.info;

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm
        min-w-[240px] max-w-[340px] animate-slide-in-right cursor-pointer
        ${config.bg} ${config.dark}
      `}
            onClick={() => onDismiss(toast.id)}
            role="alert"
            aria-live="polite"
        >
            {config.icon}
            <span className="flex-1 font-medium">{toast.message}</span>
            {toast.undoAction && (
                <button
                    className="
            ml-2 px-2 py-0.5 rounded text-xs font-bold
            bg-white/20 hover:bg-white/30 transition-colors
            focus:outline-none focus:ring-2 focus:ring-white/50
          "
                    onClick={(e) => {
                        e.stopPropagation();
                        toast.undoAction();
                        onDismiss(toast.id);
                    }}
                    aria-label="Batalkan tindakan ini"
                >
                    {toast.undoLabel || 'Undo'}
                </button>
            )}
        </div>
    );
}

// ── Toast Container ───────────────────────────────────────────────
export function ToastContainer({ toasts, onDismiss }) {
    if (!toasts.length) return null;

    return (
        <div
            className="toast-container fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
            aria-label="Notifikasi"
        >
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}
