/**
 * Sidebar.jsx
 * Left sidebar showing the list of pages.
 * Features:
 * - Page list with active highlight
 * - Inline rename (click name to edit)
 * - Right-click context menu for Duplicate + Delete
 * - Add page button at bottom
 * - Search/filter input at top
 * - Mobile: slide-in overlay drawer
 * - Desktop: always-visible fixed panel
 * Fixes: original used fixed margin-left on main content causing mobile layout breakage.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateId } from '../utils/generateId';

// ── Tag/category constants ─────────────────────────────────────────────────
const TAG_COLORS = {
    '': 'bg-slate-200 dark:bg-slate-700',
    debt: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    mission: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    activity: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    schedule: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ── Page item in sidebar ────────────────────────────────────────────────────
function PageItem({ page, isActive, onClick, onRename, onDelete, onDuplicate }) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftName, setDraftName] = useState(page.name);
    const [contextMenu, setContextMenu] = useState(null); // { x, y }
    const inputRef = useRef(null);
    const menuRef = useRef(null);

    const startRename = () => {
        setDraftName(page.name);
        setIsRenaming(true);
        setTimeout(() => inputRef.current?.select(), 30);
        setContextMenu(null);
    };

    const commitRename = () => {
        setIsRenaming(false);
        const name = draftName.trim() || page.name;
        if (name !== page.name) onRename(page.id, name);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
        if (e.key === 'Escape') { setIsRenaming(false); setDraftName(page.name); }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    // Close context menu on outside click
    useEffect(() => {
        if (!contextMenu) return;
        const close = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setContextMenu(null);
            }
        };
        window.addEventListener('mousedown', close);
        return () => window.removeEventListener('mousedown', close);
    }, [contextMenu]);

    return (
        <>
            <li
                className={`
          group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
          transition-all duration-150 select-none
          ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }
        `}
                onClick={() => { if (!isRenaming) onClick(page.id); }}
                onContextMenu={handleContextMenu}
                aria-current={isActive ? 'page' : undefined}
            >
                {/* Page icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>

                {/* Page name or rename input */}
                {isRenaming ? (
                    <input
                        ref={inputRef}
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                        className="
              flex-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
              border border-blue-400 rounded px-1.5 py-0.5 text-sm
              focus:outline-none focus:ring-1 focus:ring-blue-500
            "
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Ubah nama halaman ${page.name}`}
                    />
                ) : (
                    <span
                        className="flex-1 text-sm truncate"
                        onDoubleClick={startRename}
                        title={page.name}
                    >
                        {page.name}
                    </span>
                )}

                {/* Three-dot menu button (visible on hover) */}
                <button
                    className={`
            flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded
            hover:bg-slate-200 dark:hover:bg-slate-700 transition-opacity
            ${isActive ? 'text-blue-500' : 'text-slate-400'}
          `}
                    onClick={(e) => {
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY });
                    }}
                    aria-label={`Menu untuk ${page.name}`}
                    tabIndex={-1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm4 2a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                </button>
            </li>

            {/* Context menu */}
            {contextMenu && (
                <div
                    ref={menuRef}
                    className="
            fixed z-[500] w-44 bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-xl shadow-xl overflow-hidden animate-fade-in
          "
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    role="menu"
                >
                    <button
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        onClick={startRename}
                        role="menuitem"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Ubah Nama
                    </button>
                    <button
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => { onDuplicate(page.id); setContextMenu(null); }}
                        role="menuitem"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Duplikat
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700" />
                    <button
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => { onDelete(page.id); setContextMenu(null); }}
                        role="menuitem"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Halaman
                    </button>
                </div>
            )}
        </>
    );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar({ pages, activePage, onSelectPage, onAddPage, onRenamePage, onDeletePage, onDuplicatePage, isOpen, onClose }) {
    const [search, setSearch] = useState('');

    const filtered = pages.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        onAddPage();
        setSearch('');
        onClose?.();
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] lg:hidden animate-fade-in"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
          sidebar-panel fixed top-0 left-0 h-full w-72 z-[300]
          bg-slate-50 dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
                aria-label="Sidebar navigasi halaman"
            >
                {/* Sidebar header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-base tracking-tight">Jadwalku</span>

                    {/* Close button (mobile) */}
                    <button
                        className="ml-auto p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 lg:hidden transition-colors"
                        onClick={onClose}
                        aria-label="Tutup sidebar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search input */}
                <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari halaman..."
                            className="
                w-full pl-8 pr-3 py-1.5 rounded-lg text-sm
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-200
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-1 focus:ring-blue-400
                transition-colors
              "
                            aria-label="Cari halaman"
                        />
                    </div>
                </div>

                {/* Page list */}
                <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Daftar halaman">
                    {pages.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8 px-4">
                            Belum ada halaman. Klik "+ Halaman Baru" untuk mulai.
                        </p>
                    ) : filtered.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                            Tidak ada halaman yang cocok.
                        </p>
                    ) : (
                        <ul className="space-y-0.5" role="list">
                            {filtered.map((page) => (
                                <PageItem
                                    key={page.id}
                                    page={page}
                                    isActive={activePage === page.id}
                                    onClick={onSelectPage}
                                    onRename={onRenamePage}
                                    onDelete={onDeletePage}
                                    onDuplicate={onDuplicatePage}
                                />
                            ))}
                        </ul>
                    )}
                </nav>

                {/* Add page button */}
                <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleAdd}
                        className="
              w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
              text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800
              hover:text-blue-600 dark:hover:text-blue-400
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
              border border-dashed border-slate-300 dark:border-slate-600
            "
                        aria-label="Tambah halaman baru"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Halaman Baru
                    </button>
                </div>
            </aside>
        </>
    );
}
