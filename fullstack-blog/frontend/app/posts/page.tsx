'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Comment { id: number; author: string; content: string; }
interface Post { id: number; title: string; content: string; author: string; comments: Comment[]; }

export default function PostsPage() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({ title: '', content: '', author: '' });
    const [cmtData, setCmtData] = useState<{ [key: number]: string }>({});

    const { data: posts = [], isLoading } = useQuery<Post[]>({
        queryKey: ['posts'],
        queryFn: () => api.get('/api/posts').then(res => res.data)
    });

    const createMutation = useMutation({
        mutationFn: (data: { title: string; content: string; author: string }) => 
            api.post('/api/posts', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            setFormData({ title: '', content: '', author: '' });
            toast.success('Đã đăng bài!');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; title: string; content: string; author: string }) => 
            api.put(`/api/posts/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            setEditingId(null);
            toast.success('Đã cập nhật bài viết!');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/api/posts/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
    });

    const commentMutation = useMutation({
        mutationFn: ({ postId, content }: { postId: number, content: string }) => 
            api.post(`/api/posts/${postId}/comments`, { author: 'User', content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            setCmtData({});
            toast.success('Đã bình luận!');
        }
    });

    const handleEdit = (post: Post) => {
        setEditingId(post.id);
        setFormData({ 
            title: post.title, 
            content: post.content, 
            author: post.author 
        });
    };

    if (isLoading) 
        return <p className="text-center p-10 text-black">Đang tải...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen text-black">
            
            <h1 className="text-3xl font-bold mb-8 text-black">
                Fullstack Blog Integration
            </h1>

            {/* Form */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-10 border">
                <h2 className="text-xl font-semibold mb-4 text-black">
                    {editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h2>

                <div className="grid gap-4">
                    <input 
                        className="border rounded-lg p-2 text-black"
                        placeholder="Tiêu đề"
                        value={formData.title}
                        onChange={e => 
                            setFormData({...formData, title: e.target.value})
                        }
                    />

                    <textarea 
                        className="border rounded-lg p-2 text-black"
                        placeholder="Nội dung"
                        value={formData.content}
                        onChange={e => 
                            setFormData({...formData, content: e.target.value})
                        }
                    />

                    <input 
                        className="border rounded-lg p-2 text-black"
                        placeholder="Tác giả"
                        value={formData.author}
                        onChange={e => 
                            setFormData({...formData, author: e.target.value})
                        }
                    />

                    <div className="flex gap-2">
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                            onClick={() => 
                                editingId 
                                    ? updateMutation.mutate({ id: editingId, ...formData }) 
                                    : createMutation.mutate(formData)
                            }
                        >
                            {editingId ? 'Cập nhật' : 'Đăng bài'}
                        </button>

                        {editingId && (
                            <button 
                                className="bg-gray-200 px-6 py-2 rounded-lg text-black"
                                onClick={() => setEditingId(null)}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
                {posts.map(post => (
                    <div 
                        key={post.id} 
                        className="bg-white p-6 rounded-xl shadow-sm border group relative text-black"
                    >

                        <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(post)} 
                                className="text-black text-sm font-semibold"
                            >
                                Sửa
                            </button>

                            <button 
                                onClick={() => deleteMutation.mutate(post.id)} 
                                className="text-red-600 text-sm font-semibold"
                            >
                                Xóa
                            </button>
                        </div>

                        <h3 className="text-2xl font-bold text-black">
                            {post.title}
                        </h3>

                        <p className="text-black text-sm mb-4">
                            Đăng bởi 
                            <span className="font-medium text-black ml-1">
                                {post.author}
                            </span>
                        </p>

                        <p className="text-black leading-relaxed mb-6">
                            {post.content}
                        </p>

                        {/* Comments */}
                        <div className="border-t pt-4 bg-gray-50 -mx-6 px-6 rounded-b-xl">
                            
                            <h4 className="text-sm font-bold text-black mb-3 uppercase tracking-wider">
                                Bình luận ({post.comments?.length || 0})
                            </h4>

                            <div className="space-y-3 mb-4">
                                {post.comments?.map(cmt => (
                                    <div 
                                        key={cmt.id} 
                                        className="text-sm bg-white p-3 rounded-lg border shadow-sm text-black"
                                    >
                                        <span className="font-bold text-black">
                                            {cmt.author}:
                                        </span> 
                                        {cmt.content}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 border rounded-full px-4 py-1 text-sm text-black outline-none"
                                    placeholder="Viết bình luận..."
                                    value={cmtData[post.id] || ''}
                                    onChange={e => 
                                        setCmtData({ 
                                            ...cmtData, 
                                            [post.id]: e.target.value 
                                        })
                                    }
                                />

                                <button 
                                    className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-600"
                                    onClick={() => 
                                        commentMutation.mutate({
                                            postId: post.id,
                                            content: cmtData[post.id]
                                        })
                                    }
                                >
                                    Gửi
                                </button>
                            </div>

                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}