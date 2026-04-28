'use client';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useState, useEffect, FormEvent } from 'react';

// Định nghĩa interface cho Post để dùng TypeScript chuẩn hơn
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const fetchPosts = async () => {
    const res = await fetch('http://localhost:5000/api/posts');
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const promise = api.post('/api/posts', { title, content, author }).then(() => {
      setTitle(''); setContent(''); setAuthor('');
      fetchPosts();
    });

    toast.promise(promise, {
      loading: 'Đang lưu...',
      success: 'Đăng bài thành công!',
      error: 'Có lỗi xảy ra!',
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý bài viết</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8 p-4 border rounded shadow">
        <input className="border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder='Tiêu đề' required />
        <textarea className="border p-2 rounded" value={content} onChange={e => setContent(e.target.value)} placeholder='Nội dung' required />
        <input className="border p-2 rounded" value={author} onChange={e => setAuthor(e.target.value)} placeholder='Tác giả' required />
        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" type='submit'>Đăng bài</button>
      </form>
      
      <div className="flex flex-col gap-3">
        {posts.map(p => (
          <div key={p.id} className="p-3 border rounded shadow-sm">
            <h3 className="font-bold text-lg">{p.title}</h3>
            <p className="text-gray-600 text-sm mb-2">Bởi: {p.author}</p>
            <p>{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}