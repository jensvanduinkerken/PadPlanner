import { useRef, useState } from 'react';
import type { LatLng } from '../types/route';

interface RouteFormProps {
  onLocationSelected: (location: LatLng) => void;
  onDurationChange: (minutes: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  selectedMinutes: number;
  selectedLocation: LatLng | null;
}

export function RouteForm({
  onLocationSelected,
  onDurationChange,
  onGenerate,
  isLoading,
  selectedMinutes,
  selectedLocation,
}: RouteFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<
    Array<{ name: string; lat: string; lon: string }>
  >([]);
  const [isFocused, setIsFocused] = useState(false);

  async function handleSearch(query: string) {
    setInputValue(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const results = await response.json();
      setSuggestions(results);
    } catch (error) {
      console.error('Geocoding failed:', error);
      setSuggestions([]);
    }
  }

  function handleSelectSuggestion(suggestion: (typeof suggestions)[0]) {
    const location: LatLng = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    };
    onLocationSelected(location);
    setInputValue(suggestion.name);
    setSuggestions([]);
    setIsFocused(false);
  }

  const estimatedKm = ((selectedMinutes / 60) * 5).toFixed(1);
  const hours = Math.floor(selectedMinutes / 60);
  const mins = selectedMinutes % 60;
  const durationDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  return (
    <div className="space-y-5">
      {/* Location Input */}
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Starting Point
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
          />
          {selectedLocation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-b-0 text-sm text-slate-200 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{suggestion.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duration Section */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Duration
        </label>

        {/* Big duration display */}
        <div className="text-center mb-5">
          <span className="text-5xl font-bold text-white tabular-nums">{durationDisplay}</span>
          <p className="text-sm text-slate-500 mt-1">~{estimatedKm} km walk</p>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="10"
          max="180"
          step="5"
          value={selectedMinutes}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-full"
        />

        <div className="flex justify-between text-[10px] text-slate-600 mt-2">
          <span>10 min</span>
          <span>1 hour</span>
          <span>2 hours</span>
          <span>3 hours</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!selectedLocation || isLoading}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${
          !selectedLocation || isLoading
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] shadow-lg shadow-emerald-500/25'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="loading-dot w-1.5 h-1.5 bg-white rounded-full" />
              <div className="loading-dot w-1.5 h-1.5 bg-white rounded-full" />
              <div className="loading-dot w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span>Finding your route</span>
          </div>
        ) : (
          <span>Generate Route</span>
        )}
      </button>

      {!selectedLocation && (
        <p className="text-xs text-slate-600 text-center">Search and select a location to get started</p>
      )}
    </div>
  );
}
