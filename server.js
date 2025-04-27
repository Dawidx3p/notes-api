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

/* --- NOTES --- */

// Pobieranie wszystkich notatek
app.get('/api/notes', async (req, res) => {
  const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
  res.json(result.rows);
});

// Dodawanie nowej notatki
app.post('/api/notes', async (req, res) => {
  const { title, content, image } = req.body;
  await pool.query(
    'INSERT INTO notes (title, content, image) VALUES ($1, $2, $3)',
    [title, content, image]
  );
  res.status(201).json({ message: 'Notatka dodana' });
});

// Aktualizowanie notatki
app.put('/api/notes/:id', async (req, res) => {
  const { title, content, image } = req.body;
  const { id } = req.params;
  await pool.query(
    'UPDATE notes SET title = $1, content = $2, image = $3 WHERE id = $4',
    [title, content, image, id]
  );
  res.json({ message: 'Notatka zaktualizowana' });
});

// Usuwanie notatki
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  res.json({ message: 'Notatka usunięta' });
});

/* --- TASKS --- */

// Pobieranie zadań (one-time lub everyday)
app.get('/api/tasks', async (req, res) => {
  const type = req.query.type || 'one-time';
  const result = await pool.query(
    'SELECT * FROM tasks WHERE type = $1 ORDER BY id DESC',
    [type]
  );
  res.json(result.rows);
});

// Dodawanie zadania
app.post('/api/tasks', async (req, res) => {
  const { text, type } = req.body;
  await pool.query(
    'INSERT INTO tasks (text, type) VALUES ($1, $2)',
    [text, type]
  );
  res.status(201).json({ message: 'Zadanie dodane' });
});

// Aktualizowanie zadania (np. zmiana statusu na zrobione)
app.put('/api/tasks/:id', async (req, res) => {
  const { done } = req.body;
  const { id } = req.params;
  await pool.query(
    'UPDATE tasks SET done = $1 WHERE id = $2',
    [done, id]
  );
  res.json({ message: 'Zadanie zaktualizowane' });
});

// Usuwanie zadania
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.json({ message: 'Zadanie usunięte' });
});

// Start serwera
app.listen(PORT, () => {
  console.log(`API działa na porcie ${PORT}`);
});