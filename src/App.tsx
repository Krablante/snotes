// src/App.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import vars from './styles/vars.module.css';
import layout from './styles/Layout.module.css';
import SpacesGrid from './components/SpacesGrid';
import SpaceView from './components/SpaceView';
import Sidebar from './components/Sidebar';

export default function App() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Если не залогинен — показываем кнопку входа
  if (!user) {
    return (
      <div className={layout.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <button
          onClick={signInWithGoogle}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: vars.secondary, color: '#fff', borderRadius: vars.radius }}
        >
          Войти через Google
        </button>
      </div>
    );
  }

  // Основная разметка приложения
  return (
    <div className={layout.container} style={{ backgroundColor: vars.background, color: vars.text }}>
      <header className={layout.header}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Открыть меню"
          style={{ fontSize: '1.5rem', marginRight: vars.gap, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ☰
        </button>
        <h1 style={{ fontSize: '1.25rem', flexGrow: 1 }}>Space Notes</h1>
        <button
          onClick={logout}
          style={{ fontSize: '0.875rem', color: vars.primary, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Выйти
        </button>
      </header>

      <main className={layout.main}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<SpacesGrid />} />
            <Route path="/space/:spaceId" element={<SpaceView />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}