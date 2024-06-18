const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let adminPosts = [];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'adminpass') {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/delete-comment', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, SECRET_KEY);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.post('/admin-post', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, SECRET_KEY);
        const { title, content } = req.body;
        const post = { title, content, createdAt: new Date() };
        adminPosts.push(post);
        setTimeout(() => {
            adminPosts = adminPosts.filter(p => p !== post);
        }, 8 * 24 * 60 * 60 * 1000); // 8일 후 삭제
        res.json({ message: 'Post created' });
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



