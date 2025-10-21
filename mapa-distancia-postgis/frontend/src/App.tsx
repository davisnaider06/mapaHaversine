// frontend/src/App.tsx
import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import { Point, DistanceData } from './types';
import { getDbDistance } from './services/api.service';
import { calculateTravelTime } from './utils/calculations';
import './App.css';

interface SpeedOption {
  label: string;
  value: string;
}

const speedOptions: SpeedOption[] = [
  { label: 'Caminhando', value: '5' },
  { label: 'Bicicleta', value: '15' },
  { label: 'Carro (Cidade)', value: '60' },
  { label: 'Carro (Estrada)', value: '100' },
  { label: 'Personalizada', value: 'custom' },
];

const App: React.FC = () => {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);
  const [results, setResults] = useState<DistanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSpeed, setSelectedSpeed] = useState<string>(speedOptions[2].value); // Default to Carro (Cidade)
  const [customSpeed, setCustomSpeed] = useState<string>('30');

  const getEffectiveSpeed = (): number => {
    let speed = 1; // Default speed if parsing fails
    if (selectedSpeed === 'custom') {
      const parsedSpeed = parseFloat(customSpeed);
      if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
        speed = parsedSpeed;
      }
    } else {
      const parsedSpeed = parseFloat(selectedSpeed);
      if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
        speed = parsedSpeed;
      }
    }
    return speed;
  };

  const handleMapClick = (point: Point) => {
    if (isLoading) return;

    if (!origin) {
      setOrigin(point);
      setDestination(null); // Clear destination when setting new origin
      setResults(null);
      setError(null);
    } else if (!destination) {
      setDestination(point);
      fetchDistances(origin, point);
    } else {
      // If both origin and destination exist, clicking resets to a new origin
      setOrigin(point);
      setDestination(null);
      setResults(null);
      setError(null);
    }
  };

  const fetchDistances = async (org: Point, dest: Point) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const dbDistanceMeters = await getDbDistance(org, dest);
      const effectiveSpeed = getEffectiveSpeed();
      const dbTimeHours = calculateTravelTime(dbDistanceMeters, effectiveSpeed);

      setResults({
        dbDistance: dbDistanceMeters / 1000, // Convert meters to km for display
        dbTime: dbTimeHours,
      });

    } catch (err) {
      console.error("API Error:", err); // Log the actual error
      setError(err instanceof Error ? `Falha ao buscar dados: ${err.message}` : 'Ocorreu um erro desconhecido ao buscar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeHours: number): string => {
    if (isNaN(timeHours) || timeHours < 0) return 'Inválido';
    
    const totalMinutes = timeHours * 60;
    if (totalMinutes < 1) return 'Menos de 1 min';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}min`);

    return parts.join(' ');
  };

  const recalculateTime = (newSpeedKmh: number) => {
    if (results?.dbDistance && !isNaN(results.dbDistance)) {
      if (isNaN(newSpeedKmh) || newSpeedKmh <= 0) newSpeedKmh = 1; // Use default 1 km/h if speed is invalid

      const newTimeHours = calculateTravelTime(results.dbDistance * 1000, newSpeedKmh); // Recalculate using km distance
      setResults(prevResults => prevResults ? { ...prevResults, dbTime: newTimeHours } : null);
    }
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeedValue = event.target.value;
    setSelectedSpeed(newSpeedValue);

    const speedToRecalculate = newSpeedValue === 'custom'
      ? parseFloat(customSpeed)
      : parseFloat(newSpeedValue);

    recalculateTime(speedToRecalculate);
  };

  const handleCustomSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomSpeed = event.target.value;
    setCustomSpeed(newCustomSpeed);
    // Only recalculate if a valid number is entered
    const parsedSpeed = parseFloat(newCustomSpeed);
    if (!isNaN(parsedSpeed)) {
      recalculateTime(parsedSpeed);
    }
  };

  const clearSelection = () => {
    setOrigin(null);
    setDestination(null);
    setResults(null);
    setError(null);
  };

  const openGoogleMaps = () => {
    if (!origin || !destination) return;

    // Correct URL format for Google Maps directions
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;

    window.open(url, '_blank', 'noopener,noreferrer'); // Added security attributes
  };

  return (
    <div className="App">
      <h1>Calculadora de Distância Geodésica</h1>
      <p className="instructions">
        {!origin ? 'Clique no mapa para definir a ORIGEM.' : !destination ? 'Clique no mapa para definir o DESTINO.' : 'Clique em "Limpar" ou no mapa para recomeçar.'}
      </p>

      <MapComponent
        origin={origin}
        destination={destination}
        onMapClick={handleMapClick}
      />

      <div className="controls-container">
        <div className="speed-selector">
          <label htmlFor="speed">Velocidade Média:</label>
          <select id="speed" value={selectedSpeed} onChange={handleSpeedChange} disabled={!results}>
            {speedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {selectedSpeed === 'custom' && (
            <>
              <input
                type="number"
                value={customSpeed}
                onChange={handleCustomSpeedChange}
                min="1"
                step="1" // Allow integer steps
                style={{ width: '80px' }}
                disabled={!results}
              />
              <span>km/h</span>
            </>
          )}
        </div>
        <div className="action-buttons">
          <button onClick={clearSelection} disabled={!origin && !destination}>
            Limpar Seleção
          </button>
        </div>
      </div>


      {isLoading && <p className="loading">Calculando...</p>}
      {error && <p className="error">Erro: {error}</p>}

      {results && !isLoading && !error && (
        <div className="results-container">
          <h2>Resultados</h2>
          <div className="results-grid">
            <div className="result-card">
              <h3>Cálculo Linha Reta (PostGIS)</h3>
              <p><strong>Distância:</strong> {results.dbDistance?.toFixed(2) ?? 'N/A'} km</p>
              <p><strong>Tempo Estimado ({getEffectiveSpeed()} km/h):</strong> {formatTime(results.dbTime)}</p>
            </div>

            <div className="result-card">
              <h3>Comparação (Google Maps)</h3>
              <p>Compare a rota real (ruas e estradas) e o tempo estimado pelo Google Maps:</p>
              <div className="google-maps-button">
                <button onClick={openGoogleMaps} disabled={!origin || !destination}>
                  Abrir Rota no Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;