// src/App.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SpacesGrid from './components/SpacesGrid';
import SpaceView from './components/SpaceView';
import Sidebar from './components/Sidebar';  // ← импорт

export default function App() {
  const { user, signInWithGoogle, logout } = useAuth();
  // состояние открытия/закрытия сайдбара
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Войти через Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 flex justify-between items-center">
        {/* Кнопка открытия сайдбара */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-2xl mr-4"
          aria-label="Открыть меню"
        >
          ☰
        </button>

        <h1 className="text-xl flex-grow">Space Notes</h1>

        <button onClick={logout} className="text-sm text-gray-600">
          Выйти
        </button>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="p-4">
        <Routes>
          <Route path="/" element={<SpacesGrid />} />
          <Route path="/space/:spaceId" element={<SpaceView />} />
        </Routes>
      </main>
    </div>
  );
}
