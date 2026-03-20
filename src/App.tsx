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
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-900">
      {/* Header */}
      <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-700/50 flex items-center px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight tracking-tight">PadPlanner</h1>
            <p className="text-[11px] text-slate-400 leading-tight">Circular walking routes</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0 overflow-y-auto bg-slate-900 border-r border-slate-700/50">
          <div className="p-5 space-y-5">
            <RouteForm
              onLocationSelected={setStartLocation}
              onDurationChange={setDesiredMinutes}
              onGenerate={handleGenerate}
              isLoading={status === 'loading'}
              selectedMinutes={desiredMinutes}
              selectedLocation={startLocation}
            />

            {routeResult && (
              <div className="panel-enter">
                <RouteResult
                  result={routeResult}
                  desiredMinutes={desiredMinutes}
                  onRegenerate={handleGenerate}
                  isLoading={status === 'loading'}
                />
              </div>
            )}

            {errorMessage && (
              <div className="panel-enter bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-400 font-medium">Route generation failed</p>
                <p className="text-xs text-red-400/70 mt-1">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
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
