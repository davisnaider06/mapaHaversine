import { Point } from '../types';

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param p1 - The first point (origin).
 * @param p2 - The second point (destination).
 * @returns The distance in kilometers.
 */
export function calculateHaversineDistance(p1: Point, p2: Point): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = deg2rad(p2.lat - p1.lat);
  const dLon = deg2rad(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}