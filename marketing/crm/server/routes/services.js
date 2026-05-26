import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar catálogo de serviços
let servicesCatalog = [];

try {
  const catalogPath = join(__dirname, '../services-catalog.json');
  const catalogData = readFileSync(catalogPath, 'utf-8');
  servicesCatalog = JSON.parse(catalogData).services || [];
} catch (err) {
  console.error('Erro carregando catálogo de serviços:', err.message);
}

// GET /api/v1/services - Lista todos os serviços
router.get('/', (req, res) => {
  try {
    const { category } = req.query;

    let filtered = servicesCatalog;
    if (category) {
      filtered = servicesCatalog.filter(s => s.category === category);
    }

    res.json({
      total: filtered.length,
      services: filtered,
      categories: [...new Set(servicesCatalog.map(s => s.category))]
    });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/services/:id - Detalhes de um serviço específico
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const service = servicesCatalog.find(s => s.id === id);

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/services/category/:category - Serviços por categoria
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const services = servicesCatalog.filter(s => s.category === category);

    if (services.length === 0) {
      return res.status(404).json({ error: 'Nenhum serviço encontrado nesta categoria' });
    }

    res.json({
      category,
      total: services.length,
      services
    });
  } catch (err) {
    console.error('Error fetching services by category:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
