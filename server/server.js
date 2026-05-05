const express = require('express');
const cors = require('cors');
const pgp = require('pg-promise')();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();


app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use(express.json());


const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'blog_db',
    user: 'ivettemonfil',
    password: ''
});


app.use(session({
    store: new pgSession({
        pgPromise: db,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: 'mi_secreto_super_seguro_para_blog',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true,
        secure: false
    }
}));


function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'No autorizado', message: 'Debes iniciar sesión' });
}


const assetsPath = path.join(__dirname, '..', 'client', 'src', 'assets');

if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
}

app.use('/assets', express.static(assetsPath));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, assetsPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await db.oneOrNone(
            'SELECT id_author, name, username FROM authors WHERE username = $1 AND password = $2',
            [username, password]
        );
        
        if (user) {
            req.session.userId = user.id_author;
            req.session.userName = user.name;
            req.session.username = user.username;
            
            res.json({
                success: true,
                user: {
                    id: user.id_author,
                    name: user.name,
                    username: user.username
                }
            });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: 'Error al cerrar sesión' });
        } else {
            res.json({ success: true, message: 'Sesión cerrada' });
        }
    });
});


app.get('/session', (req, res) => {
    if (req.session.userId) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.session.userId,
                name: req.session.userName,
                username: req.session.username
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await db.any(`
            SELECT p.*, a.name as author_name 
            FROM posts p 
            LEFT JOIN authors a ON p.id_author = a.id_author 
            ORDER BY p.id_post DESC
        `);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/posts/:id_post', async (req, res) => {
    try {
        const post = await db.oneOrNone(`
            SELECT p.*, a.name as author_name 
            FROM posts p 
            LEFT JOIN authors a ON p.id_author = a.id_author 
            WHERE p.id_post = $1
        `, [req.params.id_post]);
        res.json(post || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


app.post('/posts/new', isAuthenticated, upload.single('img'), async (req, res) => {
    try {
        const { title, text } = req.body;
        const img = req.file ? req.file.originalname : null;
        
        await db.none(
            'INSERT INTO posts (title, img, text, id_author) VALUES ($1, $2, $3, $4)',
            [title, img, text || '', req.session.userId]
        );
        
        res.json({ success: true, message: 'Post creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/authors/:id_author', isAuthenticated, async (req, res) => {
    try {
        const author = await db.oneOrNone('SELECT id_author, name, birth_date, phone, email FROM authors WHERE id_author = $1', [req.params.id_author]);
        res.json(author || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});