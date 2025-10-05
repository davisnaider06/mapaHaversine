import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup, useMap } from 'react-leaflet';
import { LatLng, LatLngBounds } from 'leaflet';
import { calculateHaversineDistance } from '../../utils/haversine';
import { CalculationResult } from '../../types';
import './styles.css';

// Central coordinates for Brazil
const initialCenter: [number, number] = [-14.235, -51.925];
const DEFAULT_SPEED_KMH = 800; // Default speed

// Helper component to recenter the map view when markers change
const RecenterAutomatically = ({ origin, destination }: { origin: LatLng | null; destination: LatLng | null }) => {
    const map = useMap();
    useEffect(() => {
        if (origin && destination) {
            const bounds = new LatLngBounds([origin, destination]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (origin) {
            map.setView(origin, 10);
        }
    }, [origin, destination, map]);
    return null;
};

// Form component for coordinate and speed input
const CoordinateForm = ({ setOrigin, setDestination, speed, setSpeed, handleReset }: {
    setOrigin: (pos: LatLng) => void;
    setDestination: (pos: LatLng) => void;
    speed: number;
    setSpeed: (speed: number) => void;
    handleReset: () => void;
}) => {
    const [originLat, setOriginLat] = useState('');
    const [originLng, setOriginLng] = useState('');
    const [destLat, setDestLat] = useState('');
    const [destLng, setDestLng] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const originLatNum = parseFloat(originLat);
        const originLngNum = parseFloat(originLng);
        const destLatNum = parseFloat(destLat);
        const destLngNum = parseFloat(destLng);

        if (!isNaN(originLatNum) && !isNaN(originLngNum) && !isNaN(destLatNum) && !isNaN(destLngNum)) {
            handleReset(); // Clear previous state before setting new one
            setOrigin(new LatLng(originLatNum, originLngNum));
            setDestination(new LatLng(destLatNum, destLngNum));
        } else {
            alert('Por favor, insira valores de latitude e longitude válidos.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="coord-form">
            <div className="input-group">
                <input type="text" placeholder="Origem Lat" value={originLat} onChange={(e) => setOriginLat(e.target.value)} />
                <input type="text" placeholder="Origem Lng" value={originLng} onChange={(e) => setOriginLng(e.target.value)} />
            </div>
            <div className="input-group">
                <input type="text" placeholder="Destino Lat" value={destLat} onChange={(e) => setDestLat(e.target.value)} />
                <input type="text" placeholder="Destino Lng" value={destLng} onChange={(e) => setDestLng(e.target.value)} />
            </div>
             <div className="speed-group">
                <label htmlFor="speed">Velocidade (km/h):</label>
                <input 
                    id="speed"
                    type="number" 
                    value={speed} 
                    onChange={(e) => setSpeed(Number(e.target.value))} 
                    min="1"
                />
            </div>
            <button type="submit" className="calculate-button">Calcular com Coordenadas</button>
        </form>
    );
};


export function MapComponent() {
    const [origin, setOrigin] = useState<LatLng | null>(null);
    const [destination, setDestination] = useState<LatLng | null>(null);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [speed, setSpeed] = useState<number>(DEFAULT_SPEED_KMH);

    // Effect to perform calculation when both points or speed are updated
    useEffect(() => {
        if (origin && destination) {
            const distanceInKm = calculateHaversineDistance(origin, destination);
            
            const timeInHours = distanceInKm / speed;
            const hours = Math.floor(timeInHours);
            const minutes = Math.round((timeInHours - hours) * 60);
            
            const timeString = `${hours}h ${minutes}min`;

            setResult({
                distance: parseFloat(distanceInKm.toFixed(2)),
                time: timeString
            });
        }
    }, [origin, destination, speed]);

    const handleReset = () => {
        setOrigin(null);
        setDestination(null);
        setResult(null);
    };

    // Component to handle map clicks
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (!origin) {
                    setOrigin(e.latlng);
                } else if (!destination) {
                    setDestination(e.latlng);
                } else {
                    handleReset();
                    setOrigin(e.latlng);
                }
            },
        });
        return null;
    };

    return (
        <div className="map-wrapper">
            <MapContainer center={initialCenter} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapClickHandler />
                <RecenterAutomatically origin={origin} destination={destination} />

                {origin && <Marker position={origin}><Popup>Origem</Popup></Marker>}
                {destination && <Marker position={destination}><Popup>Destino</Popup></Marker>}

                {origin && destination && (
                    <Polyline positions={[origin, destination]} color="blue" />
                )}
            </MapContainer>

            <div className="info-panel">
                <h3>Calculadora de Distância</h3>
                <p>Clique no mapa ou insira as coordenadas abaixo.</p>

                <CoordinateForm 
                    setOrigin={setOrigin} 
                    setDestination={setDestination}
                    speed={speed}
                    setSpeed={setSpeed}
                    handleReset={handleReset}
                />

                {result && (
                    <div className="result-display">
                        <h4>Resultado</h4>
                        <p><strong>Distância (linha reta):</strong> {result.distance} km</p>
                        <p><strong>Tempo médio (a {speed} km/h):</strong> {result.time}</p>
                        <a 
                            href={`https://www.google.com/maps/dir/${origin?.lat},${origin?.lng}/${destination?.lat},${destination?.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Comparar no Google Maps
                        </a>
                    </div>
                )}
                {(origin || destination) && (
                     <button onClick={handleReset} className="reset-button">
                        Limpar Seleção
                    </button>
                )}
            </div>
        </div>
    );
}