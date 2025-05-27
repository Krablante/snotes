// src/components/SpacesGrid.tsx
import React, { useState } from 'react';
import { useSpaces, Space } from '../hooks/useSpaces';
import { useSearch, SearchResult } from '../hooks/useSearch';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './SpacesGrid.module.css';

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
    <div className={styles.container}>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search..."
        value={term}
        onChange={e => setTerm(e.target.value)}
        className={styles.search}
      />

      {/* Показываем результаты поиска, если есть term */}
      {term ? (
        <div>
          {results.length === 0 ? (
            <div className={styles.noResults}>Ничего не найдено.</div>
          ) : (
            results.map((r, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/space/${r.spaceId}`)}
                className={styles.resultCard}
              >
                {r.type === 'space' ? (
                  `🚪 Пространство: ${r.title}`
                ) : (
                  <>
                    📝 Запись: {r.text}
                    {r.date && ` (${formatDate(r.date)})`}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* По умолчанию — сетка пространств */
        <div className={styles.grid}>
          {spaces.map((s: Space) => (
            <div
              key={s.id}
              onClick={() => navigate(`/space/${s.id}`)}
              className={styles.card}
            >
              <div className={styles.title}>{s.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}