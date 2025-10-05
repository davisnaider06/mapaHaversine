import { LatLng } from 'leaflet';

export interface Point {
  lat: number;
  lng: number;
}

export interface CalculationResult {
  distance: number;
  time: string;
}