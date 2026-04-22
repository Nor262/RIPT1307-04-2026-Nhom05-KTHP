import { useState, useCallback } from 'react';

export interface Tag {
  id: string;
  name: string;
}

const initialTags: Tag[] = [
  { id: '1', name: 'React' },
  { id: '2', name: 'Frontend' },
  { id: '3', name: 'UI/UX' },
];

export default () => {
  const [tags, setTags] = useState<Tag[]>(() => {
    const stored = localStorage.getItem('blog_tags');
    return stored ? JSON.parse(stored) : initialTags;
  });

  const saveTags = (newTags: Tag[]) => {
    setTags(newTags);
    localStorage.setItem('blog_tags', JSON.stringify(newTags));
  };

  const addTag = useCallback((name: string) => {
    const newTag = { id: Date.now().toString(), name };
    saveTags([...tags, newTag]);
  }, [tags]);

  const updateTag = useCallback((id: string, name: string) => {
    saveTags(tags.map(t => t.id === id ? { ...t, name } : t));
  }, [tags]);

  const deleteTag = useCallback((id: string) => {
    saveTags(tags.filter(t => t.id !== id));
  }, [tags]);

  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
  };
};
