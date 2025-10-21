// frontend/src/types/index.ts
export interface Point {
  lat: number;
  lng: number;
}

// Interface reflects only the data currently calculated and used
export interface DistanceData {
  dbDistance: number; // Distância em km (calculada a partir do backend que retorna metros)
  dbTime: number;     // Tempo em horas (calculado no frontend)
}