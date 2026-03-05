/**
 * StatsBar.jsx
 * Displays summary statistics above the table.
 * Shows: total rows, completed count, completion percentage.
 */
import React from 'react';

export function StatsBar({ total, completed }) {
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="
      flex flex-wrap items-center gap-4 px-4 py-2.5
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400
    ">
            {/* Total */}
            <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{total}</span>
                <span>baris</span>
            </span>

            {/* Completed */}
            <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{completed}</span>
                <span>selesai</span>
            </span>

            {/* Separator */}
            <span className="text-slate-300 dark:text-slate-600 hidden sm:block">·</span>

            {/* Progress bar */}
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-semibold tabular-nums w-9 text-right">
                    {percent}%
                </span>
            </div>
        </div>
    );
}
