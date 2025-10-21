// backend/src/model.ts
import pool from './database';

interface Point {
  lat: number;
  lng: number;
}

export class DistanceCalculatorModel {
  /**
   * Calcula a distância geodésica (em linha reta sobre a superfície da Terra)
   * entre dois pontos geográficos usando a função ST_Distance do PostGIS.
   *
   * @param origin Ponto de origem com latitude e longitude.
   * @param destination Ponto de destino com latitude e longitude.
   * @returns A distância calculada em metros.
   * @throws Lança um erro se a consulta ao banco de dados falhar ou não retornar resultado.
   */
  public static async calculateDistance(origin: Point, destination: Point): Promise<number> {
    const query = `
      SELECT ST_Distance(
        ST_MakePoint($1, $2)::geography, -- Ponto de Origem (lng, lat)
        ST_MakePoint($3, $4)::geography  -- Ponto de Destino (lng, lat)
      ) as distance;
    `;

    // PostGIS espera a ordem (longitude, latitude) para ST_MakePoint
    const values = [
      origin.lng,
      origin.lat,
      destination.lng,
      destination.lat
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length > 0 && result.rows[0].distance !== null) {
        // O resultado de ST_Distance(geography, geography) é em metros
        return parseFloat(result.rows[0].distance);
      }
      // Se a query não retornar linhas ou a distância for null
      throw new Error('Não foi possível calcular a distância a partir dos pontos fornecidos.');
    } catch (error) {
      console.error('Erro ao executar a query PostGIS ST_Distance:', error);
      // Re-lança o erro para ser tratado no nível do controlador (index.ts)
      throw new Error('Falha na comunicação com o banco de dados para cálculo de distância.');
    }
  }
}