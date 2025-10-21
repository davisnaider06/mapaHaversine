// backend/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { DistanceCalculatorModel } from './model';

const app = express();
const port = process.env.PORT || 3001; // Use environment variable for port if available

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Middleware to parse JSON bodies

/**
 * Endpoint POST /api/calculate-distance
 * Calcula a distância geodésica entre dois pontos usando PostGIS.
 * Request Body: { origin: {lat: number, lng: number}, destination: {lat: number, lng: number} }
 * Response Body: { distance: number } (em metros) ou { error: string }
 */
app.post('/api/calculate-distance', async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.body;

    // Input validation
    if (
      !origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number' ||
      !destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number'
    ) {
      return res.status(400).json({ error: 'Formato inválido para origem e/ou destino. Envie { lat: number, lng: number } para ambos.' });
    }

    // Calculate distance using the model
    const distanceInMeters = await DistanceCalculatorModel.calculateDistance(origin, destination);

    // Send the successful response
    res.json({ distance: distanceInMeters });

  } catch (error) {
    // Log the error for server-side debugging
    console.error('Erro ao calcular distância:', error);

    // Send a generic server error response
    // Avoid sending detailed database errors to the client for security
    res.status(500).json({ error: 'Erro interno no servidor ao calcular a distância.' });
  }
});

// Basic root route to check if the server is running
app.get('/', (req: Request, res: Response) => {
  res.send('Backend da Calculadora de Distância está rodando.');
});


app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});