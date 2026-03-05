/**
 * LoginScreen.jsx
 * Handles authentication for Jadwalku.
 * Fixes original bug: session was immediately cleared on load, always logging out users.
 * Fix: uses localStorage ('isLoggedIn') instead of sessionStorage with no auto-clear.
 * 
 * - Credentials: admin / admin
 * - Inline error message — zero alert()
 * - Smooth fade+slide entrance animation
 */
import React, { useState } from 'react';

export function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate brief loading for UX feel
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('isLoggedIn', 'true');
                onLogin();
            } else {
                setError('Username atau password salah. Coba lagi.');
                setLoading(false);
            }
        }, 400);
    };

    return (
        <div className="
      min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
    ">
            {/* Background decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm animate-fade-in-up">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Jadwalku
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Penjadwal Pribadi Dinamis
                    </p>
                </div>

                {/* Login Card */}
                <div className="
          glass-card rounded-2xl p-8 shadow-xl
          border border-white/60 dark:border-slate-700/60
        ">
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-6">
                        Masuk ke Akun
                    </h2>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="login-username"
                                    className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5"
                                >
                                    Username
                                </label>
                                <input
                                    id="login-username"
                                    type="text"
                                    autoComplete="username"
                                    autoFocus
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                    placeholder="admin"
                                    className="
                    w-full px-3.5 py-2.5 rounded-lg text-sm
                    border border-slate-200 dark:border-slate-600
                    bg-white dark:bg-slate-700/50
                    text-slate-800 dark:text-slate-100
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  "
                                    aria-label="Username login"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="login-password"
                                    className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5"
                                >
                                    Password
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••"
                                    className="
                    w-full px-3.5 py-2.5 rounded-lg text-sm
                    border border-slate-200 dark:border-slate-600
                    bg-white dark:bg-slate-700/50
                    text-slate-800 dark:text-slate-100
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all
                  "
                                    aria-label="Password login"
                                />
                            </div>
                        </div>

                        {/* Error message — no alert() */}
                        {error && (
                            <div
                                className="mt-4 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                role="alert"
                                aria-live="assertive"
                            >
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                w-full mt-6 py-2.5 px-4 rounded-lg text-sm font-semibold text-white
                bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                shadow-md shadow-blue-500/30
              "
                            aria-label="Masuk ke Jadwalku"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Masuk...
                                </span>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
                        Hint: username <strong>admin</strong>, password <strong>admin</strong>
                    </p>
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
                    Jadwalku © 2026 — Penjadwal Pribadi
                </p>
            </div>
        </div>
    );
}
