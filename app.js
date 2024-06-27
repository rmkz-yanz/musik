const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const filename = req.body.filename;
        cb(null, `${filename}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

app.post('/add', upload.single('music'), (req, res) => {
    const { title, description, filename } = req.body;
    const music = `${filename}${path.extname(req.file.originalname)}`;

    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        const songs = JSON.parse(data);
        songs.push({ title, music, description });
        fs.writeFile('data.json', JSON.stringify(songs), (err) => {
            if (err) throw err;
            res.redirect('/');
        });
    });
});

app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;
        const songs = JSON.parse(data);
        const results = songs.filter(song => song.title.toLowerCase().includes(query));
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
