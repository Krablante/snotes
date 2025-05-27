// src/hooks/useAllSpaces.ts
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Space {
  id: string;
  title: string;
  parentId: string | null;
}

// Хук для получения всех пространств пользователя
export function useAllSpaces() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const col = collection(db, 'spaces');
    const q = query(
      col,
      where('ownerId', '==', user.uid)
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const arr: Space[] = snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<Space, 'id'>)
        }));
        setSpaces(arr);
        setLoading(false);
      },
      err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  return { spaces, loading, error };
}