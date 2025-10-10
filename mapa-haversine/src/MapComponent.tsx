import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLng, point } from 'leaflet';
import "../src/styles.css"
type Point = LatLng | null

interface GoogleMapsData{
   distance:string;
   duration:string;
}

function calculateDistance(lat1: number, lon1:number, lat2: number, lon2:number){
   const R = 6378; //raio da terra
   const dLat = (lat2-lat1) * Math.PI / 180
   const dLon = (lon2 -lon1) * Math.PI / 180

   const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   return R * c;
}

function calcularTempo(distancia:number){
   const velocidadeMedia = 80;
   const tempoEmHoras = distancia / velocidadeMedia;
  return tempoEmHoras * 60;
}

interface MapClickHandlerProps {
  onMapClick: (latlng: LatLng) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null; // Este componente retorna null, o que é válido
}

export function MapComponent(){
    const [origin, setOrigin] = useState<Point>(null);
  const [destination, setDestination] = useState<Point>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [googleMapsData, setGoogleMapsData] = useState<GoogleMapsData | null>(null);

  const initialPosition: LatLngExpression = [-14.2350, -51.9253];

  const handleMapClick = (latlng: LatLng) => {
    if (!origin || (origin && destination)) {
      setOrigin(latlng);
      setDestination(null);
      setDistance(null);
      setTime(null);
      setGoogleMapsData(null);
    } else {
      setDestination(latlng);
    }
  };
  
  useEffect(() => {
    if (origin && destination) {
      const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      setDistance(dist);
      setTime(calcularTempo(dist));
      getGoogleMapsData(origin, destination);
    }
  }, [origin, destination]);

  const getGoogleMapsData = async (origin: LatLng, destination: LatLng) => {
    const apiKey = 'AIzaSyAscyRUr7PvfCp5-x8GDbz61DTxoNJjPYo'; 
    const url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        setGoogleMapsData({
          distance: element.distance.text,
          duration: element.duration.text,
        });
      } else {
        console.error('Erro ao buscar dados do Google Maps:', data.status);
      }
    } catch (error) {
      console.error('Erro na requisição para o Google Maps:', error);
    }
  };

  
  return (
    <div className = "main">
      <h1 className='mainText'>Selecione a Origem e o Destino no Mapa</h1>
      <MapContainer center={initialPosition} zoom={5} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {origin && <Marker position={origin}><Popup>Origem</Popup></Marker>}
        {destination && <Marker position={destination}><Popup>Destino</Popup></Marker>}
        {origin && destination && <Polyline positions={[origin, destination]} color="blue" />}
      </MapContainer>

      {distance !== null && time !== null && (
        <div>
          <h2>Resultados (Cálculo em Linha Reta)</h2>
          <p>Distância: {distance.toFixed(2)} km</p>
          <p>Tempo Médio Estimado: {time.toFixed(2)} minutos</p>
        </div>
      )}

      {googleMapsData && (
        <div>
          <h2>Comparação (Google Maps)</h2>
          <p>Distância por Rota: {googleMapsData.distance}</p>
          <p>Duração da Viagem: {googleMapsData.duration}</p>
        </div>
      )}
    </div>
  );
}