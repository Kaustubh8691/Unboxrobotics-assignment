import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

/**
 * Lightweight line chart of the last readings (Recharts).
 * X axis: short time labels; Y: speed 0–120.
 */
export function SpeedHistoryChart({ history }) {
  const data = history.map((row, i) => ({
    i: i + 1,
    speed: row.speed,
    t: new Date(row.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
        Waiting for readings…
      </div>
    );
  }

  return (
    <div className="h-52 w-full rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Last {data.length} readings
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis domain={[0, 120]} width={36} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v) => [`${v} km/h`, 'Speed']}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 3, fill: '#38bdf8' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
