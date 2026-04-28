const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());


const DATA_PATH = path.join(__dirname, 'data.json');

/* Đọc dữ liệu */
async function readData() {
    try {
        const raw = await fs.readFile(DATA_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (err) {

        // Nếu chưa có file → tạo file mới
        if (err.code === 'ENOENT') {
            await writeData([]);
            return [];
        }

        console.error('Lỗi đọc file:', err);
        return [];
    }
}

/* Ghi dữ liệu */
async function writeData(data) {
    await fs.writeFile(
        DATA_PATH,
        JSON.stringify(data, null, 2)
    );
}

/* GET posts */
app.get('/api/posts', async (req, res) => {

    const posts = await readData();

    res.json(posts);
});

/* POST tạo bài */
app.post('/api/posts', async (req, res) => {

    const { title, content, author } = req.body;

    // Validation theo đề
    if (!title || !content || !author) {
        return res.status(400).json({
            error: 'Thiếu dữ liệu'
        });
    }

    const posts = await readData();

    const newPost = {
        id: Date.now(),
        title,
        content,
        author,
        comments: [],
        createdAt: new Date().toISOString()
    };

    posts.push(newPost);

    await writeData(posts);

    res.status(201).json(newPost);
});

/* PUT sửa bài (Bonus nâng cao 1) */
app.put('/api/posts/:id', async (req, res) => {

    const id = Number(req.params.id);

    const posts = await readData();

    const index = posts.findIndex(
        p => p.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            error: 'Không tìm thấy bài viết'
        });
    }

    posts[index] = {
        ...posts[index],
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    };

    await writeData(posts);

    res.json(posts[index]);
});

/* DELETE xoá bài */
app.delete('/api/posts/:id', async (req, res) => {

    const id = Number(req.params.id);

    const posts = await readData();

    const index = posts.findIndex(
        p => p.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            error: 'Không tìm thấy bài viết'
        });
    }

    posts.splice(index, 1);

    await writeData(posts);

    res.json({
        message: 'Đã xoá thành công'
    });
});


/* POST comment */
app.post('/api/posts/:id/comments', async (req, res) => {

    const postId = Number(req.params.id);

    const { author, content } = req.body;

    if (!author || !content) {
        return res.status(400).json({
            error: 'Thiếu nội dung bình luận'
        });
    }

    const posts = await readData();

    const post = posts.find(
        p => p.id === postId
    );

    if (!post) {
        return res.status(404).json({
            error: 'Bài viết không tồn tại'
        });
    }

    const newComment = {
        id: Date.now(),
        author,
        content,
        createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);

    await writeData(posts);

    res.status(201).json(newComment);
});

/* DELETE comment */
app.delete('/api/comments/:commentId', async (req, res) => {

    const commentId = Number(
        req.params.commentId
    );

    const posts = await readData();

    posts.forEach(post => {
        post.comments =
            post.comments.filter(
                c => c.id !== commentId
            );
    });

    await writeData(posts);

    res.json({
        message: 'Xoá bình luận thành công'
    });
});


app.listen(5000, () => {

    console.log(
        'Backend chạy tại http://localhost:5000'
    );

});