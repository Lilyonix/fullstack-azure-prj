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

console.log("Lancement du serveur...");

app.post('/api/message', async (req, res) => {
  const { content } = req.body;
  if (!content) {
    console.warn("Tentative d'envoi sans contenu");
    return res.status(400).send('Contenu vide');
  }

  try {
    console.log("Insertion de message utilisateur :", content);
    await sql.connect(dbConfig);
    await sql.query`INSERT INTO Messages (content, sender) VALUES (${content}, 'user')`;
    await sql.query`INSERT INTO Messages (content, sender) VALUES ('Merci pour votre message!', 'server')`;
    res.status(200).json({ message: 'Message bien reçu' });
  } catch (err) {
    console.error('Erreur SQL POST /api/message:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    console.log("Récupération des messages...");
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM Messages ORDER BY id ASC`;
    console.log(`${result.recordset.length} messages récupérés`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Erreur SQL GET /api/messages:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
