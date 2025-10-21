// frontend/src/utils/calculations.ts

/**
 * Calcula o tempo de viagem em horas.
 * @param distanceInMeters Distância em metros (vinda do DB)
 * @param averageSpeedKmh Velocidade média em km/h
 */
export function calculateTravelTime(distanceInMeters: number, averageSpeedKmh: number = 60): number {
  if (averageSpeedKmh === 0) return 0;
  
  const distanceInKm = distanceInMeters / 1000;
  const timeInHours = distanceInKm / averageSpeedKmh;
  return timeInHours;
}