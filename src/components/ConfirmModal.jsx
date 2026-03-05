/**
 * ConfirmModal.jsx
 * Reusable confirmation modal — replaces all native confirm() dialogs.
 * Features:
 * - Focus trap inside modal
 * - Escape key to cancel
 * - Enter key to confirm
 * - Accessible with aria attributes
 * - Danger variant for destructive actions
 */
import React, { useEffect, useRef } from 'react';

export function ConfirmModal({
    isOpen,
    title = 'Konfirmasi',
    message,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    onConfirm,
    onCancel,
    danger = false,
}) {
    const confirmRef = useRef(null);
    const cancelRef = useRef(null);

    // Focus confirm button when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => confirmRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard handling
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onCancel();
            // Trap focus inside modal
            if (e.key === 'Tab') {
                const focusable = [cancelRef.current, confirmRef.current].filter(Boolean);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal card */}
            <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 animate-fade-in-up">
                <h2
                    id="modal-title"
                    className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2"
                >
                    {title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
              hover:bg-slate-200 dark:hover:bg-slate-600
              transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400
            "
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium text-white
              transition-colors focus:outline-none focus:ring-2
              ${danger
                                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
                                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'
                            }
            `}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
