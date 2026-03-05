/**
 * useLocalStorage.js
 * Custom hook that syncs state with localStorage.
 * Fixes: original app had raw localStorage calls scattered everywhere.
 * 
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Value if nothing is stored yet
 * @returns [value, setValue] — same API as useState
 */
import { useState, useCallback } from 'react';

export function useLocalStorage(key, defaultValue) {
    const [value, setInternalValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setValue = useCallback(
        (updater) => {
            setInternalValue((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;
                try {
                    localStorage.setItem(key, JSON.stringify(next));
                } catch (e) {
                    console.error('useLocalStorage write error:', e);
                }
                return next;
            });
        },
        [key]
    );

    return [value, setValue];
}
