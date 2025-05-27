// src/components/SpacesGrid.tsx
import React, { useState } from 'react';
import { useSpaces, Space } from '../hooks/useSpaces';
import { useSearch, SearchResult } from '../hooks/useSearch';
import { useNavigate, useParams } from 'react-router-dom';

// Форматирование даты (DD.MM.YYYY)
const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
};

export default function SpacesGrid() {
  const { spaceId } = useParams<{ spaceId?: string }>();
  const parentId = spaceId ?? null;
  const { spaces, loading, error } = useSpaces(parentId);
  const navigate = useNavigate();

  // Поиск
  const [term, setTerm] = useState('');
  const results: SearchResult[] = useSearch(term);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="p-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search..."
        value={term}
        onChange={e => setTerm(e.target.value)}
        className="mb-4 w-full border px-2 py-1"
      />

      {/* Показываем результаты поиска, если есть term */}
      {term ? (
        <div>
          {results.length === 0 ? (
            <div>Ничего не найдено.</div>
          ) : (
            results.map((r, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/space/${r.spaceId}`)}
                className="p-2 mb-2 bg-gray-100 rounded cursor-pointer"
              >
                {r.type === 'space'
                  ? `🚪 Пространство: ${r.title}`
                  : `📝 Запись: ${r.text} (${formatDate(r.date)})`}
              </div>
            ))
          )}
        </div>
      ) : (
        /* По умолчанию — сетка пространств */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {spaces.map((s: Space) => (
            <div
              key={s.id}
              onClick={() => navigate(`/space/${s.id}`)}
              className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer"
            >
              {s.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
