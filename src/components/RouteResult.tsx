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
  const isAccurate = diffPercent <= 15;

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Distance</p>
            <p className="text-3xl font-bold text-slate-900">{distanceKm} km</p>
          </div>
          <div className="text-4xl">📍</div>
        </div>

        <div className="h-px bg-green-200" />

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-600 mb-1">Estimated Time</p>
            <p className="text-xl font-bold text-slate-900">~{actualMinutes}</p>
            <p className="text-xs text-slate-500">minutes</p>
          </div>

          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-slate-600 mb-1">Your Request</p>
            <p className="text-xl font-bold text-slate-900">{desiredMinutes}</p>
            <p className="text-xs text-slate-500">minutes</p>
          </div>
        </div>

        {/* Accuracy Badge */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-xs font-medium text-slate-600">
            {isAccurate
              ? '✓ Perfect match'
              : `Difference: ${diffPercent.toFixed(0)}%`}
          </p>
        </div>
      </div>

      {/* Warning if not accurate */}
      {!isAccurate && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Heads up:</span> This is the closest route we could find. The actual time differs slightly from your request.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            isLoading
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95'
          }`}
        >
          <span>🔄</span>
          {isLoading ? 'Generating...' : 'Regenerate'}
        </button>

        <button
          onClick={() => {
            // Could add share functionality later
            alert('Share feature coming soon!');
          }}
          className="py-3 px-4 rounded-lg font-semibold text-sm bg-blue-100 text-blue-900 hover:bg-blue-200 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>↗️</span>
          Share
        </button>
      </div>
    </div>
  );
}
