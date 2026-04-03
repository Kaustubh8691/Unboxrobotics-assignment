/**
 * Shows live Socket.IO state so users see outages immediately.
 */
export function ConnectionStatus({ connection, lastError, onRetry }) {
  const styles = {
    connected: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    connecting: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
    disconnected: 'bg-slate-700/50 text-slate-300 border-slate-600',
    error: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
  };

  const label = {
    connected: 'Live',
    connecting: 'Connecting…',
    disconnected: 'Disconnected',
    error: 'Connection error',
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${styles[connection]}`}
      role="status"
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            connection === 'connected' ? 'animate-pulse bg-emerald-400' : 'bg-current opacity-60'
          }`}
        />
        <span className="text-sm font-medium">{label[connection]}</span>
        {lastError && connection !== 'connected' && (
          <span className="text-xs opacity-90">— {lastError}</span>
        )}
      </div>
      {connection !== 'connected' && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          Retry history fetch
        </button>
      )}
    </div>
  );
}
