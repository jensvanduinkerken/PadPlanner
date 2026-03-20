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
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🚶</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">PadPlanner</h1>
              <p className="text-xs text-slate-500">Plan your perfect walk</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-full lg:w-96 overflow-y-auto bg-white border-r border-slate-200 flex flex-col">
          <div className="flex-1 p-6 space-y-6">
            {/* Form Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Plan Your Walk</h2>
              <RouteForm
                onLocationSelected={setStartLocation}
                onDurationChange={setDesiredMinutes}
                onGenerate={handleGenerate}
                isLoading={status === 'loading'}
                selectedMinutes={desiredMinutes}
                selectedLocation={startLocation}
              />
            </div>

            {/* Result Section */}
            {(routeResult || status === 'loading') && (
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Route Details</h2>
                <RouteResult
                  result={routeResult}
                  desiredMinutes={desiredMinutes}
                  onRegenerate={handleGenerate}
                  isLoading={status === 'loading'}
                />
              </div>
            )}

            {/* Error Section */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-red-900 text-sm">Something went wrong</p>
                    <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 min-h-96 lg:min-h-0 relative overflow-hidden bg-slate-100">
          <MapView
            center={startLocation}
            routeCoordinates={routeResult?.coordinates ?? null}
            isLoading={status === 'loading'}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
