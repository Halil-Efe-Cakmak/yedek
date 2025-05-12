const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Dosya yüklemek için multer ayarı
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('Dosya yüklenemedi.');

  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  const form = new FormData();

  form.append('file', fs.createReadStream(filePath));
  form.append('literal.id', req.file.filename); // unique id
  form.append('commit', 'true');

  try {
    const solrUrl = 'http://solr_container:8983/solr/searchcore/update/extract';
    const response = await axios.post(solrUrl, form, {
      headers: form.getHeaders(),
    });

    res.json({
      message: 'Dosya başarıyla Solr\'a yüklendi.',
      solrResponse: response.data,
    });
  } catch (err) {
    console.error('Solr bağlantı hatası:', err.message);
    res.status(500).json({ error: 'Solr\'a gönderme başarısız oldu.' });
  }
});

app.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Boş sorgu' });

  try {
    const solrUrl = `http://solr_container:8983/solr/searchcore/select?q=content:${encodeURIComponent(query)}&wt=json`;
    const response = await axios.get(solrUrl);
    res.json({ results: response.data.response.docs });
  } catch (err) {
    res.status(500).json({ error: 'Arama hatası' });
  }
});


