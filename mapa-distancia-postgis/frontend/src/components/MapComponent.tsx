// frontend/src/components/MapComponent.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { Point } from '../types';

// Configuração do ícone padrão do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix icon path issue with bundlers like Webpack
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowSize: [41, 41]  // size of the shadow
});
L.Marker.prototype.options.icon = DefaultIcon;


interface MapProps {
  origin: Point | null;
  destination: Point | null;
  onMapClick: (point: Point) => void;
}

// Componente helper para capturar cliques no mapa
function MapClickHandler({ onMapClick }: { onMapClick: (point: Point) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Coordenadas aproximadas do centro de Jacareí, SP
const jacareiCenter: LatLngExpression = [-23.3054, -45.9659];

const MapComponent: React.FC<MapProps> = ({ origin, destination, onMapClick }) => {
  const linePositions: LatLngExpression[] = [];

  if (origin) linePositions.push([origin.lat, origin.lng]);
  if (destination) linePositions.push([destination.lat, destination.lng]);

  return (
    <MapContainer
      center={jacareiCenter}
      zoom={13}
      // Increased map height
      style={{ height: '650px', width: '100%', borderRadius: '6px', border: '1px solid #ccc', margin: '20px 0' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      />

      <MapClickHandler onMapClick={onMapClick} />

      {origin && <Marker position={[origin.lat, origin.lng]}><Popup>Origem</Popup></Marker>}
      {destination && <Marker position={[destination.lat, destination.lng]}><Popup>Destino</Popup></Marker>}

      {linePositions.length === 2 && (
        <Polyline positions={linePositions} color="#3498db" weight={5} opacity={0.7} />
      )}
    </MapContainer>
  );
};

export default MapComponent;