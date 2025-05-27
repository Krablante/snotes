// src/components/SpaceView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSpaces, Space } from '../hooks/useSpaces';
import { useSpace } from '../hooks/useSpace';
import styles from './SpaceView.module.css';

// helper: format 'YYYY-MM-DD' to 'DD.MM.YYYY'
const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
};

export default function SpaceView() {
  const { spaceId } = useParams<{ spaceId?: string }>();
  const parentId = spaceId ?? null;
  const navigate = useNavigate();
  const { user } = useAuth();

  // load metadata (including template)
  const meta = useSpace(parentId!);
  const template = meta?.template || 'dated';

  // load child spaces
  const { spaces: childSpaces, loading: loadingSpaces } = useSpaces(parentId);
  const hasChildren = childSpaces.length > 0;

  // load items regardless of template
  const [items, setItems] = useState<{ id: string; text: string; date: string }[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !parentId) {
      setLoadingItems(false);
      return;
    }
    setLoadingItems(true);
    const itemsCol = collection(db, 'spaces', parentId, 'items');
    const itemsQuery = query(itemsCol, where('ownerId', '==', user.uid));
    return onSnapshot(
      itemsQuery,
      snapshot => {
        const arr = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as { text: string; date: string })
        }));
        setItems(arr);
        setLoadingItems(false);
      },
      err => {
        console.error(err);
        setError(err.message);
        setLoadingItems(false);
      }
    );
  }, [user, parentId]);

  // group by date for dated template
  const grouped = useMemo(() => {
    return items.reduce((acc, it) => {
      if (!acc[it.date]) acc[it.date] = [];
      acc[it.date].push(it);
      return acc;
    }, {} as Record<string, typeof items>);
  }, [items]);

  // new item state
  const [newText, setNewText] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  const addItem = async () => {
    if (!newText.trim() || !user || !parentId) return;
    await addDoc(collection(db, 'spaces', parentId, 'items'), {
      text: newText.trim(),
      date: template === 'dated' ? newDate : '',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewText('');
  };

  const deleteItem = async (id: string) => {
    if (!parentId) return;
    await deleteDoc(doc(db, 'spaces', parentId, 'items', id));
  };

  if (!meta || loadingSpaces || loadingItems) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles.container}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Назад</button>

      {/* child spaces */}
      {childSpaces.length > 0 && (
        <div className={styles.childList}>
          {childSpaces.map((s: Space) => (
            <div key={s.id} className={styles.childItem} onClick={() => navigate(`/space/${s.id}`)}>
              {s.title}
            </div>
          ))}
        </div>
      )}

      {/* plain template */}
      {template === 'plain' && !hasChildren && (
        <>
          <form className={styles.form} onSubmit={e => { e.preventDefault(); addItem(); }}>
            <input
              className={styles.input}
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="type smth"
            />
            <button className={styles.button} type="submit">+</button>
          </form>
          <ul className={styles.list}>
            {items.map(it => (
              <li className={styles.item} key={it.id}>
                <span>{it.text}</span>
                <button className={styles.delete} onClick={() => deleteItem(it.id)}>✕</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* dated template */}
      {template === 'dated' && !hasChildren && (
        <>
          <form className={styles.form} onSubmit={e => { e.preventDefault(); addItem(); }}>
            <input
              className={styles.inputDate}
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="type smth"
            />
            <button className={styles.button} type="submit">+</button>
          </form>
          {Object.entries(grouped)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([dateKey, list]) => (
              <div className={styles.group} key={dateKey}>
                <h3 className={styles.groupTitle}>{formatDate(dateKey)}</h3>
                <ul className={styles.list}>
                  {list.map(it => (
                    <li className={styles.item} key={it.id}>
                      <span>{it.text}</span>
                      <button className={styles.delete} onClick={() => deleteItem(it.id)}>✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      )}
    </div>
  );
}