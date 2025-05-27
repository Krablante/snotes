// src/hooks/useSpace.ts
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export interface SpaceMeta {
  title: string;
  parentId: string | null;
  template: 'dated' | 'plain';
}

export function useSpace(spaceId: string) {
  const { user } = useAuth();
  const [meta, setMeta] = useState<SpaceMeta | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'spaces', spaceId), snap => {
      const data = snap.data();
      if (!data) return;
      const template = (data.template as 'dated' | 'plain') || 'dated';
      setMeta({
        title: data.title,
        parentId: data.parentId,
        template,
      });
    });
    return unsub;
  }, [spaceId, user]);

  return meta;
}