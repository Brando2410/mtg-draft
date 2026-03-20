import express from 'express';
import cors from 'cors';
import { PersistenceService } from './services/PersistenceService';

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

export default app;
