import type { RouteResult as RouteResultType } from '../types/route';

interface RouteResultProps {
  result: RouteResultType | null;
  desiredMinutes: number;
  onRegenerate: () => void;
  isLoading: boolean;
}

export function RouteResult({ result, desiredMinutes, onRegenerate, isLoading }: RouteResultProps) {
  if (!result) {
    return null;
  }

  const distanceKm = (result.actualDistanceMeters / 1000).toFixed(1);
  const actualMinutes = Math.round(result.actualDurationSeconds / 60);
  const diffPercent = Math.abs((actualMinutes - desiredMinutes) / desiredMinutes) * 100;

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Route Details</h2>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-600">Distance</p>
          <p className="text-lg font-bold text-gray-800">{distanceKm} km</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Duration</p>
          <p className="text-lg font-bold text-gray-800">~{actualMinutes} min</p>
        </div>
      </div>

      {diffPercent > 15 && (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-3 border border-amber-200">
          ℹ️ Closest route found. Actual time differs by {diffPercent.toFixed(0)}% from requested duration.
        </p>
      )}

      <button
        onClick={onRegenerate}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md font-medium transition text-sm ${
          isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {isLoading ? 'Generating...' : 'Try Another Route'}
      </button>
    </div>
  );
}
