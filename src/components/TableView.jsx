/**
 * TableView.jsx
 * The main table component for a single page.
 * Manages:
 * - useTableReducer for all row/column operations
 * - Auto-save via useDebounce (fixes: no auto-save in original)
 * - Search/filter by row content
 * - Tag filter
 * - Last-saved indicator
 * - Delete column (fixes: completely missing from original)
 * - Sticky "No." column (fixes: white-space:nowrap overflow bug)
 * - ConfirmModal for destructive actions
 * - Undo delete for rows
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTableReducer, INITIAL_TABLE } from '../hooks/useTableReducer';
import { useDebounce } from '../hooks/useDebounce';
import { exportToCSV } from '../utils/csvExport';
import { EmptyState } from './EmptyState';
import { StatsBar } from './StatsBar';
import { ConfirmModal } from './ConfirmModal';

// ── Tag constants ─────────────────────────────────────────────────────────
export const TAGS = [
    { value: '', label: 'Semua', emoji: '📋', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    { value: 'debt', label: 'Hutang', emoji: '🔴', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'mission', label: 'Misi', emoji: '🟡', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { value: 'activity', label: 'Aktivitas', emoji: '🟢', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { value: 'schedule', label: 'Jadwal', emoji: '🔵', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
];

// ── Editable cell ─────────────────────────────────────────────────────────
function EditableCell({ value, onChange, className = '', placeholder = '' }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

    const startEdit = () => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 10); };
    const commit = () => { setEditing(false); if (draft !== value) onChange(draft); };

    return (
        <div
            className={`min-h-[28px] ${className}`}
            onClick={startEdit}
        >
            {editing ? (
                <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === 'Escape') { setEditing(false); setDraft(value); } }}
                    rows={1}
                    placeholder={placeholder}
                    className="
            cell-input w-full bg-blue-50 dark:bg-blue-900/20
            border border-blue-300 dark:border-blue-700 rounded px-1.5 py-0.5
            text-sm text-slate-800 dark:text-slate-100 resize-none
            focus:outline-none focus:ring-1 focus:ring-blue-400
          "
                    aria-label="Edit sel"
                />
            ) : (
                <span
                    className={`block text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 px-1 rounded ${!value ? 'text-slate-300 dark:text-slate-600 italic' : ''}`}
                >
                    {value || placeholder || 'Klik untuk edit'}
                </span>
            )}
        </div>
    );
}

// ── Editable column header ────────────────────────────────────────────────
function EditableHeader({ label, onRename, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(label);
    const inputRef = useRef(null);

    const startEdit = () => { setDraft(label); setEditing(true); setTimeout(() => inputRef.current?.select(), 10); };
    const commit = () => { setEditing(false); const name = draft.trim() || label; if (name !== label) onRename(name); };

    return (
        <div className="th-group th-wrapper">
            {editing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); } }}
                    className="
            flex-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
            border border-blue-400 rounded px-1.5 py-0.5 text-xs font-semibold
            focus:outline-none focus:ring-1 focus:ring-blue-400 uppercase tracking-wider
          "
                    aria-label={`Ubah nama kolom ${label}`}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span
                    className="flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onDoubleClick={startEdit}
                    title={`Klik dua kali untuk ubah nama kolom "${label}"`}
                >
                    {label}
                </span>
            )}
            {/* Delete column button — was completely missing in original app */}
            <button
                className="delete-col-btn p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                aria-label={`Hapus kolom ${label}`}
                title={`Hapus kolom "${label}"`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ── Main TableView ────────────────────────────────────────────────────────
export function TableView({ page, savedTable, onSave, showToast }) {
    const [tableState, dispatch] = useTableReducer(savedTable || INITIAL_TABLE);
    const [search, setSearch] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, danger }
    const [newColName, setNewColName] = useState('');
    const [addingCol, setAddingCol] = useState(false);
    const colInputRef = useRef(null);

    // Auto-save: debounced 500ms (fixes: original required manual button click + alert popup)
    const debouncedTable = useDebounce(tableState, 500);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        onSave(debouncedTable);
        setLastSaved(new Date());
    }, [debouncedTable, onSave]);

    // Load new page table on page switch
    useEffect(() => {
        dispatch({ type: 'SET_TABLE', table: savedTable || INITIAL_TABLE });
        isFirstRender.current = true;
        setSearch('');
        setTagFilter('');
        setLastSaved(null);
    }, [page.id]);

    // Filtered rows
    const filteredRows = tableState.rows.filter((row) => {
        const matchesSearch = !search || [
            ...Object.values(row.cells),
        ].some((v) => String(v || '').toLowerCase().includes(search.toLowerCase()));
        const matchesTag = !tagFilter || row.tag === tagFilter;
        return matchesSearch && matchesTag;
    });

    // Stats
    const total = tableState.rows.length;
    const completed = tableState.rows.filter((r) => r.done).length;

    // ── Actions ────────────────────────────────────────────────────────────
    const addRow = useCallback(() => {
        dispatch({ type: 'ADD_ROW' });
    }, []);

    const deleteRow = useCallback((row, index) => {
        setConfirmModal({
            title: 'Hapus Baris?',
            message: 'Baris ini akan dihapus. Kamu bisa batalkan dalam 5 detik.',
            danger: true,
            onConfirm: () => {
                dispatch({ type: 'DELETE_ROW', rowId: row.id });
                showToast('Baris dihapus', 'undo', {
                    duration: 5000,
                    undoLabel: 'Batalkan',
                    undoAction: () => {
                        dispatch({ type: 'RESTORE_ROW', row, index });
                        showToast('Baris dipulihkan', 'success');
                    },
                });
            },
        });
    }, [showToast]);

    const deleteColumn = useCallback((col) => {
        setConfirmModal({
            title: `Hapus Kolom "${col.label}"?`,
            message: `Semua data di kolom ini akan hilang secara permanen.`,
            danger: true,
            onConfirm: () => {
                dispatch({ type: 'DELETE_COLUMN', colId: col.id });
                showToast(`Kolom "${col.label}" dihapus`, 'success');
            },
        });
    }, [showToast]);

    const addColumn = useCallback(() => {
        const label = newColName.trim() || 'Kolom Baru';
        dispatch({ type: 'ADD_COLUMN', label });
        setNewColName('');
        setAddingCol(false);
        showToast(`Kolom "${label}" ditambahkan`, 'success');
    }, [newColName, showToast]);

    const handleExportCSV = useCallback(() => {
        const headers = ['No.', ...tableState.columns.map((c) => c.label), 'Kategori', 'Selesai'];
        const rows = tableState.rows.map((row, i) => [
            i + 1,
            ...tableState.columns.map((c) => row.cells[c.id] || ''),
            row.tag || '',
            row.done ? 'Ya' : 'Tidak',
        ]);
        exportToCSV(headers, rows, page.name);
        showToast('File CSV berhasil diunduh', 'success');
    }, [tableState, page.name, showToast]);

    // Last saved text
    const lastSavedText = () => {
        if (!lastSaved) return null;
        const diffMs = Date.now() - lastSaved.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Disimpan baru saja';
        if (mins === 1) return 'Disimpan 1 menit lalu';
        return `Disimpan ${mins} menit lalu`;
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* ── Action bar ─────────────────────────────────────────────────── */}
            <div className="action-bar flex flex-wrap items-center gap-2 no-print">
                {/* Search */}
                <div className="search-bar relative flex-1 min-w-[160px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari baris..."
                        className="
              w-full pl-8 pr-3 py-1.5 rounded-lg text-sm
              bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-700
              text-slate-700 dark:text-slate-200
              placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors
            "
                        aria-label="Cari baris dalam tabel"
                    />
                </div>

                {/* Tag filters */}
                <div className="flex gap-1 flex-wrap">
                    {TAGS.map((tag) => (
                        <button
                            key={tag.value}
                            onClick={() => setTagFilter(tag.value === tagFilter ? '' : tag.value)}
                            className={`
                flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${tagFilter === tag.value || (tag.value === '' && tagFilter === '')
                                    ? tag.color + ' ring-2 ring-offset-1 ring-blue-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:opacity-80'
                                }
              `}
                            aria-pressed={tagFilter === tag.value}
                            aria-label={`Filter: ${tag.label}`}
                        >
                            {tag.emoji} {tag.label}
                        </button>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={addRow}
                        className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white
              bg-blue-500 hover:bg-blue-600 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
              min-h-[44px] sm:min-h-0
            "
                        aria-label="Tambah baris baru"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Baris</span>
                    </button>

                    <button
                        onClick={() => { setAddingCol(true); setTimeout(() => colInputRef.current?.focus(), 50); }}
                        className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
              border border-slate-200 dark:border-slate-700
              hover:border-blue-400 hover:text-blue-600 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-400
              min-h-[44px] sm:min-h-0
            "
                        aria-label="Tambah kolom baru"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        <span className="hidden sm:inline">Kolom</span>
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
              border border-slate-200 dark:border-slate-700
              hover:border-emerald-400 hover:text-emerald-600 transition-colors
              focus:outline-none focus:ring-2 focus:ring-emerald-400
              min-h-[44px] sm:min-h-0
            "
                        aria-label="Ekspor ke CSV"
                        title="Ekspor ke CSV"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                </div>
            </div>

            {/* Add column inline input */}
            {addingCol && (
                <div className="flex items-center gap-2 animate-fade-in no-print">
                    <input
                        ref={colInputRef}
                        type="text"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') addColumn();
                            if (e.key === 'Escape') { setAddingCol(false); setNewColName(''); }
                        }}
                        placeholder="Nama kolom baru..."
                        className="
              flex-1 px-3 py-1.5 rounded-lg text-sm
              border border-blue-400 bg-white dark:bg-slate-800
              text-slate-800 dark:text-slate-100
              focus:outline-none focus:ring-2 focus:ring-blue-400
            "
                        aria-label="Nama kolom baru"
                    />
                    <button onClick={addColumn} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Konfirmasi tambah kolom">Tambah</button>
                    <button onClick={() => { setAddingCol(false); setNewColName(''); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none" aria-label="Batal">Batal</button>
                </div>
            )}

            {/* Stats bar */}
            {total > 0 && <StatsBar total={total} completed={completed} />}

            {/* Table or empty state */}
            {total === 0 ? (
                <EmptyState onAddRow={addRow} />
            ) : (
                <div className="table-scroll-container">
                    <table className="jadwal-table" aria-label={`Tabel halaman ${page.name}`}>
                        <thead>
                            <tr>
                                {/* No. sticky column */}
                                <th className="sticky-col w-12 text-center" scope="col">No.</th>

                                {/* Dynamic columns */}
                                {tableState.columns.map((col) => (
                                    <th key={col.id} className="min-w-[120px]" scope="col">
                                        <EditableHeader
                                            label={col.label}
                                            onRename={(label) => dispatch({ type: 'RENAME_COLUMN', colId: col.id, label })}
                                            onDelete={() => deleteColumn(col)}
                                        />
                                    </th>
                                ))}

                                {/* Tag */}
                                <th className="w-28" scope="col">Kategori</th>

                                {/* Done */}
                                <th className="w-20 text-center" scope="col">Selesai</th>

                                {/* Actions */}
                                <th className="w-16 text-center no-print" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={tableState.columns.length + 4} className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm italic">
                                        Tidak ada baris yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            ) : filteredRows.map((row, visibleIndex) => {
                                const realIndex = tableState.rows.findIndex((r) => r.id === row.id);
                                return (
                                    <tr
                                        key={row.id}
                                        className={row.done ? 'row-done' : ''}
                                        aria-label={`Baris ${visibleIndex + 1}${row.done ? ' (selesai)' : ''}`}
                                    >
                                        {/* No. */}
                                        <td className="sticky-col text-center text-xs font-mono text-slate-400 select-none">
                                            {visibleIndex + 1}
                                        </td>

                                        {/* Data cells */}
                                        {tableState.columns.map((col) => (
                                            <td key={col.id}>
                                                <EditableCell
                                                    value={row.cells[col.id] || ''}
                                                    onChange={(val) => dispatch({ type: 'EDIT_CELL', rowId: row.id, colId: col.id, value: val })}
                                                    placeholder="—"
                                                />
                                            </td>
                                        ))}

                                        {/* Tag dropdown */}
                                        <td>
                                            <select
                                                value={row.tag || ''}
                                                onChange={(e) => dispatch({ type: 'SET_TAG', rowId: row.id, tag: e.target.value })}
                                                className="
                          w-full text-xs rounded-md px-1.5 py-1
                          border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-700
                          text-slate-700 dark:text-slate-200
                          focus:outline-none focus:ring-1 focus:ring-blue-400
                        "
                                                aria-label="Pilih kategori baris"
                                            >
                                                <option value="">—</option>
                                                <option value="debt">🔴 Hutang</option>
                                                <option value="mission">🟡 Misi</option>
                                                <option value="activity">🟢 Aktivitas</option>
                                                <option value="schedule">🔵 Jadwal</option>
                                            </select>
                                        </td>

                                        {/* Done checkbox */}
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={row.done}
                                                onChange={() => dispatch({ type: 'TOGGLE_DONE', rowId: row.id })}
                                                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                                                aria-label={`Tandai baris ${visibleIndex + 1} selesai`}
                                            />
                                        </td>

                                        {/* Delete row */}
                                        <td className="text-center no-print">
                                            <button
                                                className="delete-row-btn p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-w-[32px] min-h-[32px]"
                                                onClick={() => deleteRow(row, realIndex)}
                                                aria-label={`Hapus baris ${visibleIndex + 1}`}
                                                title="Hapus baris"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Last saved indicator */}
            {lastSaved && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-right animate-fade-in no-print" aria-live="polite">
                    ✓ {lastSavedText()}
                </p>
            )}

            {/* Print-only footer */}
            <div className="print-footer">
                Jadwalku — {page.name}
            </div>

            {/* Confirmation modal */}
            {confirmModal && (
                <ConfirmModal
                    isOpen={true}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    danger={confirmModal.danger}
                    confirmLabel="Hapus"
                    cancelLabel="Batal"
                    onConfirm={() => {
                        confirmModal.onConfirm?.();
                        setConfirmModal(null);
                    }}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    );
}
