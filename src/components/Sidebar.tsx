// src/components/Sidebar.tsx
import React, { useMemo } from 'react';
import { useAllSpaces, Space } from '../hooks/useAllSpaces';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';

interface TreeNode {
  id: string;
  title: string;
  children: TreeNode[];
}

function buildTree(spaces: Space[]): TreeNode[] {
  const map: Record<string, TreeNode> = {};
  const roots: TreeNode[] = [];

  spaces.forEach(s => {
    map[s.id] = { id: s.id, title: s.title, children: [] };
  });
  spaces.forEach(s => {
    const node = map[s.id];
    if (s.parentId && map[s.parentId]) {
      map[s.parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { spaces, loading } = useAllSpaces();
  const navigate = useNavigate();

  const tree = useMemo(() => buildTree(spaces), [spaces]);

  const handleAdd = async (parentId: string | null) => {
    const title = window.prompt('Название нового пространства:');
    if (!title || !user) return;
    // вот добавили выбор шаблона:
    const isDated = window.confirm(
      'Использовать список по датам? OK — да (dated), Cancel — простой список (plain).'
    );
    await addDoc(collection(db, 'spaces'), {
      title,
      parentId,
      template: isDated ? 'dated' : 'plain',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleDelete = async (spaceId: string) => {
    if (!window.confirm('Удалить это пространство и все его дочерние?')) return;
    // Удаляем документ. Firestore каскадно не удалит детей автоматически,
    // их можно удалить вручную или через функцию Cloud Function,
    // здесь просто удаляем выбранный узел.
    await deleteDoc(doc(db, 'spaces', spaceId));
  };

  const renderNode = (node: TreeNode, parentId: string | null) => (
    <li key={node.id}>
      <div className={styles.node}>
        <span
          onClick={() => {
            navigate(`/space/${node.id}`);
            onClose();
          }}
          style={{ flexGrow: 1, cursor: 'pointer' }}
        >
          {node.title}
        </span>
        <button
          className={styles.manageBtn}
          title="Добавить подпространство"
          onClick={() => handleAdd(node.id)}
        >
          +
        </button>
        <button
          className={styles.manageBtn}
          title="Удалить пространство"
          onClick={() => handleDelete(node.id)}
        >
          ✕
        </button>
      </div>
      {node.children.length > 0 && (
        <ul className={styles.sublist}>
          {node.children.map(child => renderNode(child, node.id))}
        </ul>
      )}
    </li>
  );

  if (!isOpen) return null;
  if (loading) return <div className={styles.sidebar}>Загрузка...</div>;

  return (
    <div className={styles.sidebarOverlay} onClick={onClose}>
      <div className={styles.sidebar} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.managerHeader}>
          <button
            onClick={() => handleAdd(null)}
            className={styles.manageBtn}
            title="Добавить корневое пространство"
          >
            + Корневое пространство
          </button>
        </div>
        <nav>
          <ul className={styles.rootList}>
            {tree.map(node => renderNode(node, null))}
          </ul>
        </nav>
      </div>
    </div>
  );
}