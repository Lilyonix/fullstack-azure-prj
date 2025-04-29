const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

app.use(express.static('public'));
app.use(express.json());

async function connectDB() {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error('Erreur connexion SQL :', err.message);
    throw new Error('Erreur connexion SQL : ' + err.message);
  }
}

app.post('/api/message', async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Contenu vide' });

  try {
    const pool = await connectDB();
    await pool.request()
        .input('content', sql.NVarChar, content)
        .input('sender', sql.NVarChar, 'user')
        .query('INSERT INTO Messages (content, sender) VALUES (@content, @sender)');

    await pool.request()
        .input('content', sql.NVarChar, 'Merci pour votre message!')
        .input('sender', sql.NVarChar, 'server')
        .query('INSERT INTO Messages (content, sender) VALUES (@content, @sender)');

    res.status(200).json({ message: 'Message bien reçu' });
  } catch (err) {
    console.error('Erreur API POST /api/message :', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Messages ORDER BY created_at ASC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Erreur API GET /api/messages :', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
