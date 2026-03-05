/**
 * useDebounce.js
 * Returns a debounced version of the value that only updates
 * after the specified delay (in ms) of inactivity.
 * Used for auto-save: 500ms after last cell edit, save triggers silently.
 */
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
