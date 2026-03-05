/**
 * EmptyState.jsx
 * Shown when a page has no rows yet.
 * Encourages user to add their first row.
 */
import React from 'react';

export function EmptyState({ onAddRow }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-fade-in">
            {/* Illustration */}
            <div className="w-20 h-20 mb-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </div>

            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Halaman ini masih kosong
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                Mulai tambahkan baris untuk mencatat jadwal, misi, atau tagihan pribadimu.
            </p>

            <button
                onClick={onAddRow}
                className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white
          bg-blue-500 hover:bg-blue-600 active:bg-blue-700
          transition-colors shadow-md shadow-blue-500/25
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        "
                aria-label="Tambah baris pertama"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Baris Pertama
            </button>
        </div>
    );
}
