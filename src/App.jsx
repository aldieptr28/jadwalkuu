/**
 * App.jsx
 * Root component of the Jadwalku application.
 * Manages:
 * - Authentication state
 * - Dark mode class on <html>
 * - Global toast state
 * - Page collection state (CRUD) in localStorage
 * - Active page selection
 * - Mobile sidebar drawer state
 */
import React, { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { ToastContainer } from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import { generateId } from './utils/generateId';
import { INITIAL_TABLE } from './hooks/useTableReducer';

export default function App() {
  // Global hooks
  const { toasts, showToast, dismissToast } = useToast();

  // State from localStorage
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);
  const [pages, setPages] = useLocalStorage('pages', []);

  // Local UI state
  const [activePageId, setActivePageId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply dark mode on mount / change
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Set initial active page if none selected but pages exist
  useEffect(() => {
    if (pages.length > 0 && !activePageId) {
      setActivePageId(pages[0].id);
    } else if (pages.length === 0) {
      setActivePageId(null);
    }
  }, [pages, activePageId]);

  // ── Page CRUD Actions ─────────────────────────────────────────────────
  const addPage = useCallback(() => {
    const newPage = { id: generateId(), name: `Halaman ${pages.length + 1}` };
    setPages((prev) => [...prev, newPage]);
    setActivePageId(newPage.id);
    showToast(`Halaman "${newPage.name}" dibuat`, 'success');
  }, [pages.length, setPages, showToast]);

  const renamePage = useCallback((id, newName) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
    showToast(`Halaman diubah nama menjadi "${newName}"`, 'success');
  }, [setPages, showToast]);

  const deletePage = useCallback((id) => {
    const pageToDelete = pages.find((p) => p.id === id);
    if (!pageToDelete) return;

    // Save table data to restore later if user undoes
    const rawTable = localStorage.getItem(`tableData-${id}`);

    setPages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (activePageId === id) setActivePageId(next[0]?.id || null);
      return next;
    });

    localStorage.removeItem(`tableData-${id}`);

    showToast(`Halaman "${pageToDelete.name}" dihapus`, 'undo', {
      duration: 6000,
      undoLabel: 'Batalkan',
      undoAction: () => {
        setPages((prev) => [...prev, pageToDelete]);
        if (rawTable) localStorage.setItem(`tableData-${id}`, rawTable);
        setActivePageId(id);
        showToast('Halaman dipulihkan', 'success');
      },
    });
  }, [pages, activePageId, setPages, showToast]);

  const duplicatePage = useCallback((id) => {
    const original = pages.find((p) => p.id === id);
    if (!original) return;

    const newId = generateId();
    const newPage = { id: newId, name: `${original.name} (Copy)` };

    // Copy table data
    const rawTable = localStorage.getItem(`tableData-${id}`);
    if (rawTable) localStorage.setItem(`tableData-${newId}`, rawTable);

    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, newPage);
      return next;
    });

    setActivePageId(newId);
    showToast(`Halaman diduplikat sebagai "${newPage.name}"`, 'success');
  }, [pages, setPages, showToast]);

  // ── Table Save Flow ───────────────────────────────────────────────────
  // Called by TableView when debounced table state changes
  const saveTableData = useCallback((pageId, tableState) => {
    if (!pageId) return;
    try {
      localStorage.setItem(`tableData-${pageId}`, JSON.stringify(tableState));
    } catch (e) {
      console.error('Failed to save table', e);
      showToast('Gagal menyimpan otomatis. Storage penuh?', 'error');
    }
  }, [showToast]);

  // Load table data for the active page
  const getTableData = useCallback((pageId) => {
    if (!pageId) return null;
    try {
      const raw = localStorage.getItem(`tableData-${pageId}`);
      return raw ? JSON.parse(raw) : INITIAL_TABLE;
    } catch {
      return INITIAL_TABLE;
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const activePageData = pages.find((p) => p.id === activePageId);
  const activeTable = getTableData(activePageId);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans tabular-nums">

      {/* Sidebar Navigation */}
      <Sidebar
        pages={pages}
        activePage={activePageId}
        onSelectPage={(id) => { setActivePageId(id); setSidebarOpen(false); }}
        onAddPage={addPage}
        onRenamePage={renamePage}
        onDeletePage={deletePage}
        onDuplicatePage={duplicatePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        <MainContent
          activePage={activePageId}
          pageData={activePageData}
          savedTable={activeTable}
          onSaveTable={saveTableData}
          onOpenSidebar={() => setSidebarOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark((prev) => !prev)}
          showToast={showToast}
        />
      </div>

      {/* Toast Notifier */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
