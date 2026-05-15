const express = require('express');
const cors = require('cors');
const pgp = require('pg-promise')();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const app = express();

// ============ CORS CON VARIABLES DE ENTORNO ============
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// ============ BASE DE DATOS CON VARIABLES DE ENTORNO ============
const db = pgp({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'blog_db',
    user: process.env.DB_USER || 'ivettemonfil',
    password: process.env.DB_PASS || ''
});

// ============ SESIÓN CON VARIABLES DE ENTORNO ============
app.use(session({
    store: new pgSession({
        pgPromise: db,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'mi_secreto_super_seguro_para_blog',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// ============ MIDDLEWARE DE AUTENTICACIÓN ============
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'No autorizado', message: 'Debes iniciar sesión' });
}

// ============ CONFIGURACIÓN DE ASSETS ============
const assetsPath = path.join(__dirname, '..', 'client', 'src', 'assets');

if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
}

app.use('/assets', express.static(assetsPath));

// ============ CONFIGURACIÓN DE MULTER ============
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, assetsPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// ============ ENDPOINTS ============

// Login
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

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ error: 'Error al cerrar sesión' });
        } else {
            res.json({ success: true, message: 'Sesión cerrada' });
        }
    });
});

// Verificar sesión
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

// Obtener todos los posts
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

// Obtener un post por ID
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


app.get('/seed', async (req, res) => {
    try {
        await db.none(`
            CREATE TABLE IF NOT EXISTS authors (
                id_author SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                birth_date DATE,
                phone VARCHAR(50),
                email VARCHAR(100),
                username VARCHAR(50),
                password VARCHAR(255)
            )
        `);
        console.log(' Tabla authors creada');

        await db.none(`
            CREATE TABLE IF NOT EXISTS posts (
                id_post SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                text TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                img VARCHAR(500),
                id_author INTEGER REFERENCES authors(id_author)
            )
        `);
        console.log(' Tabla posts creada');

        await db.none(`
            INSERT INTO authors (name, birth_date, phone, email, username, password) 
            VALUES ('Carolina Ramírez', '2005-12-05', '235 110 42 32', 'carito.hola1119@gmail.com', 'carolina', 'carolina123')
            ON CONFLICT (id_author) DO NOTHING
        `);
        console.log(' Autor insertado');

        await db.none(`
            INSERT INTO posts (title, text, img, id_author) VALUES 
            ('Guayabina tomando el sol', 'Guayabina disfruta mucho tomar el sol en el jardín, se acuesta en su lugar favorito y cierra los ojitos.', '78cab2dc-ef08-43c7-87e3-baa15ea99815.JPG', 1),
            ('Guayabina con peluche', 'A Guayabina le encanta dormir abrazada a su peluche favorito, no se despierta hasta que le dan de comer.', '74AEFE3F-A8BF-44C2-94B2-AB96CB0A9EA6.JPG', 1),
            ('Guayabina bañada', 'Después del baño, Guayabina queda muy suavecita y corre por toda la casa muy feliz.', '6d3bd2e2-62d4-4ba5-b0b1-03e5f74d9068.JPG', 1),
            ('Pichirola pensativa', 'Pichirola se queda pensativa mirando por la ventana, esperando a que llegue su persona favorita.', 'E8948BF9-D580-481E-8B76-16FC77E58ED6.JPG', 1),
            ('Pichi coqueta', 'Pichi se pone muy coqueta cuando le ponemos moños, le encanta sentirse bonita.', 'IMG_3147.jpg', 1),
            ('Pichirola Selfie', 'A Pichirola le encanta tomarse selfies, siempre posa cuando ve el celular y sale muy linda.', 'IMG_9260.jpg', 1),
            ('Pichi y Guayabina', 'Pichi y Guayabina son las mejores amigas, siempre juegan juntas y se cuidan la una a la otra.', '72F89785-A3C5-4BFC-906D-B004CD81E3DD.JPG', 1)
            ON CONFLICT (id_post) DO NOTHING
        `);
        console.log(' Posts insertados');

        res.json({ success: true, message: 'Base de datos inicializada correctamente' });
    } catch (error) {
        console.error('Error en seed:', error);
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});