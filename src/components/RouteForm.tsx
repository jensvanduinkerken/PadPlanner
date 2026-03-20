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

  return (
    <div className="space-y-6">
      {/* Location Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Starting Point
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter a location (e.g., Amsterdam)"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 placeholder-slate-400"
          />
          {selectedLocation && (
            <div className="absolute right-3 top-3 text-green-500">✓</div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-sm text-slate-900 transition-colors"
              >
                <div className="font-medium">{suggestion.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duration Input */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Walking Duration
          </label>
          <span className="text-2xl font-bold text-blue-600">{selectedMinutes}</span>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min="10"
            max="180"
            step="5"
            value={selectedMinutes}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>10 min</span>
            <span>90 min</span>
            <span>180 min</span>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Estimated Distance</span>
            <span className="font-semibold text-slate-900">{estimatedKm} km</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Pace</span>
            <span className="font-semibold text-slate-900">~5 km/h</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!selectedLocation || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
          !selectedLocation || isLoading
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-lg hover:shadow-xl'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating Route...</span>
          </>
        ) : (
          <>
            <span>📍</span>
            <span>Generate Route</span>
          </>
        )}
      </button>
    </div>
  );
}
