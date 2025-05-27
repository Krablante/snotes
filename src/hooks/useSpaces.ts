// src/hooks/useSpaces.ts
import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Space {
  id: string;
  title: string;
  parentId: string | null;
}

export function useSpaces(parentId: string | null) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, 'spaces'),
      where('ownerId', '==', user.uid),
      where('parentId', '==', parentId)
    );
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const result: Space[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Space, 'id'>)
        }));
        setSpaces(result);
        setLoading(false);
      },
      err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user, parentId]);

  const addSpace = async (title: string) => {
    if (!user) throw new Error('No user');
    await addDoc(collection(db, 'spaces'), {
      title,
      parentId,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  return { spaces, loading, error, addSpace };
}