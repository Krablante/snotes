// src/hooks/useSearch.ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  collectionGroup,
  onSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export type SearchResult =
  | { type: 'space'; spaceId: string; title: string }
  | { type: 'item'; spaceId: string; text: string; date: string };

export function useSearch(term: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!user || !term.trim()) {
      setResults([]);
      return;
    }
    const lower = term.toLowerCase();

    // Subscribe to spaces matching term
    const spacesQuery = query(
      collection(db, 'spaces'),
      where('ownerId', '==', user.uid)
    );
    const unsubSpaces = onSnapshot(
      spacesQuery,
      (snap: QuerySnapshot<DocumentData>) => {
        const matchedSpaces: SearchResult[] = snap.docs
          .map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...(d.data() as { title: string }) }))
          .filter(s => s.title.toLowerCase().includes(lower))
          .map(s => ({ type: 'space', spaceId: s.id, title: s.title }));
        setResults(prev => [...matchedSpaces, ...prev.filter(r => r.type === 'item')]);
      },
      err => {
        console.warn('Search spaces listener error', err);
      }
    );

    // Subscribe to items matching term, with ownerId filter
    const itemsQuery = query(
      collectionGroup(db, 'items'),
      where('ownerId', '==', user.uid)
    );
    const unsubItems = onSnapshot(
      itemsQuery,
      (snap: QuerySnapshot<DocumentData>) => {
        const matchedItems: SearchResult[] = [];
        snap.docs.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
          const data = d.data() as { text: string; date: string; ownerId: string };
          if (data.text.toLowerCase().includes(lower)) {
            const parentRef = d.ref.parent.parent;
            if (parentRef) {
              matchedItems.push({ type: 'item', spaceId: parentRef.id, text: data.text, date: data.date });
            }
          }
        });
        setResults(prev => [...prev.filter(r => r.type === 'space'), ...matchedItems]);
      },
      err => {
        console.warn('Search items listener error', err);
      }
    );

    return () => {
      unsubSpaces();
      unsubItems();
    };
  }, [term, user]);

  return results;
}
