import express from 'express';

const router = express.Router();
const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

async function proxyToAI(req, res, endpoint) {
  try {
    const response = await fetch(`${AI_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      message: 'AI service is unavailable',
      detail: error.message,
    });
  }
}

router.post('/analyze-all', async (req, res) => proxyToAI(req, res, '/api/analyze-all'));
router.post('/chat', async (req, res) => proxyToAI(req, res, '/api/chat'));
router.post('/gps-track', async (req, res) => proxyToAI(req, res, '/api/gps-track'));
router.post('/recommend', async (req, res) => proxyToAI(req, res, '/api/recommend'));
router.post('/predict-price', async (req, res) => proxyToAI(req, res, '/api/predict-price'));

router.get('/health', async (_req, res) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/api/health`);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      message: 'AI service is unavailable',
      detail: error.message,
    });
  }
});

export default router;
