import { useState } from 'react';
import { useOSRM } from './hooks/useOSRM';
import { MapView } from './components/MapView';
import { RouteForm } from './components/RouteForm';
import { RouteResult } from './components/RouteResult';
import type { RouteResult as RouteResultType, LatLng } from './types/route';
import './App.css';

function App() {
  const { generateRoute } = useOSRM();

  const [startLocation, setStartLocation] = useState<LatLng | null>(null);
  const [desiredMinutes, setDesiredMinutes] = useState<number>(30);
  const [routeResult, setRouteResult] = useState<RouteResultType | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!startLocation) return;

    setStatus('loading');
    setRouteResult(null);
    setErrorMessage(null);

    try {
      const result = await generateRoute(startLocation, desiredMinutes);
      setRouteResult(result);
      setStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(message);
      setStatus('error');
      console.error('Route generation failed:', error);
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row gap-4 p-4 bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-96 flex flex-col">
        <RouteForm
          onLocationSelected={setStartLocation}
          onDurationChange={setDesiredMinutes}
          onGenerate={handleGenerate}
          isLoading={status === 'loading'}
          selectedMinutes={desiredMinutes}
          selectedLocation={startLocation}
        />

        <RouteResult
          result={routeResult}
          desiredMinutes={desiredMinutes}
          onRegenerate={handleGenerate}
          isLoading={status === 'loading'}
        />

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700" role="alert">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-96 md:min-h-auto rounded-lg overflow-hidden shadow-lg">
        <MapView
          center={startLocation}
          routeCoordinates={routeResult?.coordinates ?? null}
          isLoading={status === 'loading'}
        />
      </div>
    </div>
  );
}

export default App;
