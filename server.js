const express = require('express');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Galeria',
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  pool.query('SELECT * FROM foto INNER JOIN Category ON foto.CategoryId = Category.id ORDER BY created_at DESC;', (err, photos) => {
    if (err) {
      console.error('Error al obtener las fotos:', err);
      res.status(500).send('Error al obtener las fotos.');
    } else {
      res.render('index', { photos });
    }
  });
});

app.get('/upload', (req, res) => {
  pool.query('SELECT * FROM Category', (err, categories) => {
    if (err) {
      console.error('Error al obtener las categorías:', err);
      res.status(500).send('Error al obtener las categorías.');
    } else {
      res.render('upload', { categories });
    }
  });
});

app.post('/addCategory', (req, res) => {
    const { newCategory } = req.body;
  
    pool.query('INSERT INTO Category (categoria) VALUES (?)', [newCategory], (err, result) => {
      if (err) {
        console.error('Error al agregar la categoría:', err);
        res.status(500).send('Error al agregar la categoría.');
      } else {
        res.redirect('/upload');
      }
    });
  });

app.post('/upload', upload.single('image'), (req, res) => {
  const { title, category } = req.body;
  const image = req.file.buffer.toString('base64');

  pool.query(
    'INSERT INTO foto (image, title, CategoryId, created_at) VALUES (?, ?, ?, now())',
    [image, title, category],
    (err) => {
      if (err) {
        console.error('Error al subir la foto:', err);
        res.status(500).send('Error al subir la foto.');
      } else {
        res.redirect('/');
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
