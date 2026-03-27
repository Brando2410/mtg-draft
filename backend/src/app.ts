import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { PersistenceService } from './services/PersistenceService';
import { AssetService } from './services/AssetService';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API REST per Salvataggio Cubi ---
app.post('/api/cubes', async (req, res) => {
  const cube = req.body;
  if (!cube || !cube.name) return res.status(400).json({ error: 'Dati cubo non validi' });

  try {
    const fileName = await PersistenceService.saveCube(cube);
    res.json({ message: 'Cubo salvato con successo', id: fileName });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il salvataggio' });
  }
});

app.get('/api/cubes', async (req, res) => {
  try {
    const cubes = await PersistenceService.listCubes();
    res.json(cubes);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la lettura dei cubi' });
  }
});

app.get('/api/cubes/:id', async (req, res) => {
  try {
    const cube = await PersistenceService.getCube(req.params.id);
    if (!cube) return res.status(404).json({ error: 'Cubo non trovato' });
    res.json(cube);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
});

app.delete('/api/cubes/:id', async (req, res) => {
  try {
    const success = await PersistenceService.deleteCube(req.params.id);
    if (success) res.json({ message: 'Cubo eliminato con successo' });
    else res.status(404).json({ error: 'Cubo non trovato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
});

// --- API REST per Mazzi (Decks) ---
app.post('/api/decks', async (req, res) => {
  const deck = req.body;
  if (!deck || !deck.name) return res.status(400).json({ error: 'Dati mazzo non validi' });

  try {
    const fileName = await PersistenceService.saveDeck(deck);
    res.json({ message: 'Mazzo salvato con successo', id: fileName });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il salvataggio' });
  }
});

app.get('/api/decks', async (req, res) => {
  try {
    const decks = await PersistenceService.listDecks();
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la lettura dei mazzi' });
  }
});

app.get('/api/decks/:id', async (req, res) => {
  try {
    const deck = await PersistenceService.getDeck(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Mazzo non trovato' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento del mazzo' });
  }
});

app.delete('/api/decks/:id', async (req, res) => {
  try {
    const success = await PersistenceService.deleteDeck(req.params.id);
    if (success) res.json({ message: 'Mazzo eliminato con successo' });
    else res.status(404).json({ error: 'Mazzo non trovato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'eliminazione' });
  }
});

// --- Asset Management ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type; // 'avatars' or 'wallpapers'
    const targetPath = type === 'avatars' ? AssetService.getAvatarsDir() : AssetService.getWallpapersDir();
    if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    // Mantieni il nome originale o puliscilo
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

app.get('/api/assets/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const files = type === 'avatars' ? await AssetService.listAvatars() : await AssetService.listWallpapers();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero degli asset' });
  }
});

app.post('/api/assets/:type', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nessun file caricato' });
  res.json({ message: 'File caricato con successo', filename: req.file.filename });
});

app.delete('/api/assets/:type/:filename', async (req, res) => {
  const { type, filename } = req.params;
  try {
    const success = type === 'avatars' ? await AssetService.deleteAvatar(filename) : await AssetService.deleteWallpaper(filename);
    if (success) res.json({ message: 'File eliminato con successo' });
    else res.status(404).json({ error: 'File non trovato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore nell\'eliminazione' });
  }
});

// --- Servizio File Statici per il Frontend (Produzione) ---
// Cerchiamo la cartella dist in più punti per supportare sia local che monorepo build
const possibleFrontendPaths = [
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../../../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist')
];

const frontendPath = possibleFrontendPaths.find(p => fs.existsSync(p)) || '';

if (frontendPath) {
  console.log('Serving frontend from:', frontendPath);
  app.use(express.static(frontendPath));
  
  // Rotta catch-all per gestire il routing lato client (Single Page App)
  app.get(/.*/, (req, res, next) => {
    // Escludiamo le API
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.warn('Frontend distribution not found. API mode only.');
}

export default app;
