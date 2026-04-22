import { useState, useCallback } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  date: string;
  tags: string[];
  status: 'Nháp' | 'Đã đăng';
  views: number;
}

const initialPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Giới thiệu về React và Ant Design',
    slug: 'gioi-thieu-react-ant-design',
    summary: 'Tìm hiểu cách xây dựng giao diện chuyên nghiệp với React và thư viện Ant Design.',
    content: '# Giới thiệu\nReact là một thư viện JavaScript phổ biến...\n\n## Ant Design\nAnt Design là một hệ thống thiết kế cho các sản phẩm doanh nghiệp.',
    coverImage: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    author: 'Admin',
    date: '2024-04-22',
    tags: ['React', 'Frontend'],
    status: 'Đã đăng',
    views: 120,
  },
];

export default () => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const stored = localStorage.getItem('blog_posts');
    return stored ? JSON.parse(stored) : initialPosts;
  });

  const savePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('blog_posts', JSON.stringify(newPosts));
  };

  const addPost = useCallback((post: Omit<BlogPost, 'id' | 'views' | 'date'>) => {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      views: 0,
      date: new Date().toISOString().split('T')[0],
    };
    savePosts([newPost, ...posts]);
  }, [posts]);

  const updatePost = useCallback((updatedPost: BlogPost) => {
    savePosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  }, [posts]);

  const deletePost = useCallback((id: string) => {
    savePosts(posts.filter(p => p.id !== id));
  }, [posts]);

  const incrementView = useCallback((id: string) => {
    savePosts(posts.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
  }, [posts]);

  return {
    posts,
    addPost,
    updatePost,
    deletePost,
    incrementView,
  };
};
