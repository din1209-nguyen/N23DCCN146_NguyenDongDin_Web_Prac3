// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // chỉ cho phép NextJS
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

let posts = [
    { id: 1, title: 'Bài viết đầu tiên', content: 'Nội dung bài 1', author: 'Admin' },
    { id: 2, title: 'Hướng dẫn NextJS', content: 'Nội dung bài 2', author: 'Admin' },
];

app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.listen(5000, () => console.log('Backend chạy tại port :5000'));