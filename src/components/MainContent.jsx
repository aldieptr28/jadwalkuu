/**
 * MainContent.jsx
 * The main container for the active page content.
 * Includes the top bar (title, dark mode toggle, print button) and holds the TableView.
 */
import React from 'react';
import { TableView } from './TableView';
import { DarkModeToggle } from './DarkModeToggle';

export function MainContent({
    activePage,
    pageData, // The actual { id, name } object
    savedTable,
    onSaveTable,
    onOpenSidebar,
    isDark,
    onToggleDark,
    showToast,
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors">

            {/* ── Top Bar ────────────────────────────────────────────────────── */}
            <header className="
        top-bar flex-shrink-0 flex items-center justify-between px-4 h-14
        border-b border-slate-200 dark:border-slate-800
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10
      ">
                <div className="flex items-center gap-3">
                    {/* Mobile hamburger menu */}
                    <button
                        onClick={onOpenSidebar}
                        className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
                        aria-label="Buka menu navigasi"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page title */}
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-md print-header" title={pageData?.name || 'Jadwalku'}>
                        {pageData?.name || 'Pilih Halaman'}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {/* Print button */}
                    {pageData && (
                        <button
                            onClick={handlePrint}
                            className="
                p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800
                hover:text-slate-700 dark:hover:text-slate-300 transition-colors
              "
                            aria-label="Cetak halaman"
                            title="Cetak tabel (PDF/Printer)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </button>
                    )}

                    {/* Dark mode toggle */}
                    <DarkModeToggle isDark={isDark} onToggle={onToggleDark} />
                </div>
            </header>

            {/* ── Content Area ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 relative">
                {pageData ? (
                    <TableView
                        page={pageData}
                        savedTable={savedTable}
                        onSave={(table) => onSaveTable(pageData.id, table)}
                        showToast={showToast}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500 italic">
                        Silakan pilih atau buat halaman baru dari sidebar.
                    </div>
                )}
            </div>

        </main>
    );
}
