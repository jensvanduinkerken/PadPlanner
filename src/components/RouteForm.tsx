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
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-800">PadPlanner</h1>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Location
        </label>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Enter your starting point"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
              >
                {suggestion.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Walking Duration: {selectedMinutes} minutes
        </label>
        <input
          type="range"
          min="10"
          max="180"
          step="5"
          value={selectedMinutes}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          Approximately {((selectedMinutes / 60) * 5).toFixed(1)} km
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!selectedLocation || isLoading}
        className={`w-full py-2 px-4 rounded-md font-medium transition ${
          !selectedLocation || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isLoading ? 'Generating...' : 'Generate Route'}
      </button>
    </div>
  );
}
