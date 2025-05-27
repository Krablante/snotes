// src/hooks/useItems.ts
import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Item {
  id: string;
  text: string;
  date: string;      // YYYY-MM-DD
}

export function useItems(spaceId: string, date: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const itemsCol = collection(db, 'spaces', spaceId, 'items');
    const q = query(
      itemsCol,
      where('ownerId', '==', user.uid),
      where('date', '==', date)
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setItems(
          snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<Item, 'id'>)
          }))
        );
        setLoading(false);
      },
      err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [user, spaceId, date]);

  const addItem = async (text: string) => {
    if (!user) throw new Error('No user');
    const itemsCol = collection(db, 'spaces', spaceId, 'items');
    await addDoc(itemsCol, {
      text,
      date,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const deleteItem = async (itemId: string) => {
    await deleteDoc(doc(db, 'spaces', spaceId, 'items', itemId));
  };

  return { items, loading, error, addItem, deleteItem };
}
