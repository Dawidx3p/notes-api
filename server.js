import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicjalizacja tabel
const init = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT,
      content TEXT,
      image TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      text TEXT,
      done BOOLEAN DEFAULT FALSE,
      type TEXT
    );
  `);
};
init();

// NOTES
app.get('/api/notes', async (req, res) => {
  const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/api/notes', async (req, res) => {
  const { title, content, image } = req.body;
  await pool.query('INSERT INTO notes (title, content, image) VALUES ($1, $2, $3)', [title, content, image]);
  res.status(201).json({ message: 'Notatka dodana' });
});

app.put('/api/notes/:id', async (req, res) => {
  const { title, content } = req.body;
  await pool.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3', [title, content, req.params.id]);
  res.json({ message: 'Zaktualizowano' });
});

app.delete('/api/notes/:id', async (req, res) => {
  await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
  res.json({ message: 'Usunięto' });
});

// TASKS
app.get('/api/tasks', async (req, res) => {
  const type = req.query.type || 'one-time';
  const result = await pool.query('SELECT * FROM tasks WHERE type = $1 ORDER BY id DESC', [type]);
  res.json(result.rows);
});

app.post('/api/notes', async (req, res) => {
  const { title, content, image } = req.body;
  await pool.query('INSERT INTO notes (title, content, image) VALUES ($1, $2, $3)', [title, content, image]);
  res.status(201).json({ message: 'Notatka dodana' });
});

app.put('/api/notes/:id', async (req, res) => {
  const { title, content, image } = req.body;
  await pool.query('UPDATE notes SET title = $1, content = $2, image = $3 WHERE id = $4', [title, content, image, req.params.id]);
  res.json({ message: 'Zaktualizowano' });
});

app.delete('/api/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Zadanie usunięte' });
});

app.listen(PORT, () => {
  console.log(`API działa na porcie ${PORT}`);
});