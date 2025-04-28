const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: false }
};

app.use(express.static('public'));
app.use(express.json());

app.post('/api/message', async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).send('Contenu vide');

  try {
    await sql.connect(dbConfig);
    await sql.query`INSERT INTO Messages (content, sender) VALUES (${content}, 'user')`;
    await sql.query`INSERT INTO Messages (content, sender) VALUES ('Merci pour votre message!', 'server')`;
    res.status(200).send('Message reçu');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM Messages ORDER BY created_at ASC`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
