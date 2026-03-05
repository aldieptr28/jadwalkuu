/**
 * useToast.js
 * Manages the toast notification queue.
 * No alert(), confirm(), or prompt() — all user feedback goes through toasts.
 * 
 * Toast shape: { id, message, variant, undoAction, duration }
 * Variants: 'success' | 'error' | 'info' | 'undo'
 */
import { useState, useCallback } from 'react';
import { generateId } from '../utils/generateId';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, variant = 'info', options = {}) => {
        const id = generateId();
        const duration = options.duration ?? (variant === 'undo' ? 5000 : 3000);
        const toast = {
            id,
            message,
            variant,
            undoAction: options.undoAction ?? null,
            undoLabel: options.undoLabel ?? 'Undo',
        };

        setToasts((prev) => [...prev, toast]);

        // Auto-dismiss after duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, showToast, dismissToast };
}
