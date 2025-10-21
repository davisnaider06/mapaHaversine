// frontend/src/services/api.service.ts
import { Point } from '../types';

// URL do nosso backend
const API_BASE_URL = 'http://localhost:3001';

/**
 * Busca a distância calculada pelo banco de dados (PostGIS).
 * (Requisito 3.7.3)
 */
export async function getDbDistance(origin: Point, destination: Point): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/calculate-distance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ origin, destination }),
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar distância do DB');
  }

  const data = await response.json();
  return data.distance; // Distância em metros
}
