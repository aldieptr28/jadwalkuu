/**
 * useTableReducer.js
 * Central reducer for all table operations.
 * Fixes original bugs:
 * - No delete column action (now fully implemented)
 * - Raw localStorage calls replaced with proper state management
 * 
 * Table state shape:
 * {
 *   columns: [{ id, label }],   // custom columns only (no No./Done/Actions)
 *   rows: [{
 *     id, cells: { [colId]: string }, done: boolean, tag: string
 *   }]
 * }
 */
import { useReducer } from 'react';
import { generateId } from '../utils/generateId';

export const INITIAL_TABLE = {
    columns: [{ id: generateId(), label: 'Kegiatan' }],
    rows: [],
};

function tableReducer(state, action) {
    switch (action.type) {
        // ── Row operations ──────────────────────────────────────────
        case 'ADD_ROW': {
            const newRow = {
                id: generateId(),
                cells: Object.fromEntries(state.columns.map((c) => [c.id, ''])),
                done: false,
                tag: '',
            };
            return { ...state, rows: [...state.rows, newRow] };
        }

        case 'DELETE_ROW': {
            return {
                ...state,
                rows: state.rows.filter((r) => r.id !== action.rowId),
            };
        }

        case 'RESTORE_ROW': {
            // Insert the restored row back at its original index
            const newRows = [...state.rows];
            const idx = Math.min(action.index ?? newRows.length, newRows.length);
            newRows.splice(idx, 0, action.row);
            return { ...state, rows: newRows };
        }

        case 'EDIT_CELL': {
            return {
                ...state,
                rows: state.rows.map((r) =>
                    r.id === action.rowId
                        ? { ...r, cells: { ...r.cells, [action.colId]: action.value } }
                        : r
                ),
            };
        }

        case 'TOGGLE_DONE': {
            return {
                ...state,
                rows: state.rows.map((r) =>
                    r.id === action.rowId ? { ...r, done: !r.done } : r
                ),
            };
        }

        case 'SET_TAG': {
            return {
                ...state,
                rows: state.rows.map((r) =>
                    r.id === action.rowId ? { ...r, tag: action.tag } : r
                ),
            };
        }

        // ── Column operations ────────────────────────────────────────
        case 'ADD_COLUMN': {
            const newCol = { id: generateId(), label: action.label || 'Kolom Baru' };
            return {
                columns: [...state.columns, newCol],
                rows: state.rows.map((r) => ({
                    ...r,
                    cells: { ...r.cells, [newCol.id]: '' },
                })),
            };
        }

        case 'DELETE_COLUMN': {
            // Fully implemented — was completely missing in the original app
            return {
                columns: state.columns.filter((c) => c.id !== action.colId),
                rows: state.rows.map((r) => {
                    const cells = { ...r.cells };
                    delete cells[action.colId];
                    return { ...r, cells };
                }),
            };
        }

        case 'RENAME_COLUMN': {
            return {
                ...state,
                columns: state.columns.map((c) =>
                    c.id === action.colId ? { ...c, label: action.label } : c
                ),
            };
        }

        // ── Full reset (load from storage) ───────────────────────────
        case 'SET_TABLE': {
            return action.table;
        }

        default:
            return state;
    }
}

/**
 * Custom hook wrapping useReducer for table state.
 * @param {object} initialTable - Initial table state (from localStorage)
 */
export function useTableReducer(initialTable) {
    return useReducer(tableReducer, initialTable ?? INITIAL_TABLE);
}
