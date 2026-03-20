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
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Distance</p>
          <p className="text-2xl font-bold text-white mt-1">{distanceKm}<span className="text-sm text-slate-400 ml-1">km</span></p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Duration</p>
          <p className="text-2xl font-bold text-white mt-1">~{actualMinutes}<span className="text-sm text-slate-400 ml-1">min</span></p>
        </div>
      </div>

      {/* Accuracy indicator */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
        isAccurate
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isAccurate ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        {isAccurate
          ? 'Route matches your requested duration'
          : `Closest route found (${diffPercent.toFixed(0)}% difference)`}
      </div>

      {/* Regenerate Button */}
      <button
        onClick={onRegenerate}
        disabled={isLoading}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          isLoading
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600 hover:text-white active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="loading-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <div className="loading-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <div className="loading-dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
            </div>
            <span>Regenerating...</span>
          </div>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try a different route</span>
          </>
        )}
      </button>
    </div>
  );
}
