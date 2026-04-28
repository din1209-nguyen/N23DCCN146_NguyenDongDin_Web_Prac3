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

  const handleDelete = async (id: number) => {
  // 1. Xác nhận người dùng
  if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
  
  try {
    // 2. Gọi API xoá
    await api.delete(`/api/posts/${id}`);
    // 3. Cập nhật state NGAY (optimistic update)
    // — không cần gọi lại API, UX nhanh hơn
    setPosts(prev => prev.filter(p => p.id !== id));
    // 4. Hiển thị toast thành công
    toast.success('Đã xoá bài viết');
  } catch (err) {
    toast.error('Xoá thất bại, thử lại!');
    // Rollback: gọi lại server để đồng bộ dữ liệu
    fetchPosts();
    }
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
          <div key={p.id} className='flex justify-between items-start p-3 border rounded mb-2 shadow-sm'>
            <div>
              <h3 className='font-bold text-lg'>{p.title}</h3>
              <p className='text-sm text-gray-500 mb-1'>{p.author} · {p.content}</p>
            </div>
            <button 
              onClick={() => handleDelete(p.id)} 
              className='text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-1 rounded transition-colors'
            >
              Xoá
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}