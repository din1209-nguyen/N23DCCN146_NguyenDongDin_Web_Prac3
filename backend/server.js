const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'data.json');

async function readData() {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch { return []; }
}

async function writeData(data) {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}


app.get('/api/posts', async (req, res) => {
    const posts = await readData();
    res.json(posts);
});

app.post('/api/posts', async (req, res) => {
    const posts = await readData();
    const newPost = { 
        id: Date.now(), 
        ...req.body, 
        comments: [], 
        createdAt: new Date().toISOString() 
    };
    posts.push(newPost);
    await writeData(posts);
    res.status(201).json(newPost);
});

app.put('/api/posts/:id', async (req, res) => {
    const id = Number(req.params.id);
    const posts = await readData();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy' });

    posts[index] = { ...posts[index], ...req.body };
    await writeData(posts);
    res.json(posts[index]);
});

app.delete('/api/posts/:id', async (req, res) => {
    const id = Number(req.params.id);
    let posts = await readData();
    posts = posts.filter(p => p.id !== id);
    await writeData(posts);
    res.json({ message: 'Xoá thành công' });
});

app.post('/api/posts/:id/comments', async (req, res) => {
    const postId = Number(req.params.id);
    const { author, content } = req.body;
    const posts = await readData();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return res.status(404).json({ error: 'Bài viết không tồn tại' });

    const newComment = { id: Date.now(), author, content, createdAt: new Date().toISOString() };
    post.comments.push(newComment);
    
    await writeData(posts);
    res.status(201).json(newComment);
});

app.delete('/api/comments/:commentId', async (req, res) => {
    const commentId = Number(req.params.commentId);
    const posts = await readData();
    
    posts.forEach(post => {
        post.comments = post.comments.filter(c => c.id !== commentId);
    });

    await writeData(posts);
    res.json({ message: 'Xoá bình luận thành công' });
});

app.listen(5000, () => console.log('Backend chạy tại http://localhost:5000'));