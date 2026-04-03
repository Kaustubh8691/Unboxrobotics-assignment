import GaugeChart from 'react-gauge-chart';

const MAX = 120;

/**
 * Circular gauge (0–120) plus large numeric readout.
 * react-gauge-chart uses percent 0–1 for needle position.
 */
export function SpeedGauge({ speed }) {
  const safe = Math.min(Math.max(Number(speed) || 0, 0), MAX);
  const percent = safe / MAX;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md">
        <GaugeChart
          id="speed-gauge"
          nrOfLevels={24}
          colors={['#22c55e', '#eab308', '#f97316', '#ef4444']}
          arcWidth={0.22}
          percent={percent}
          textColor="transparent"
          needleColor="#f8fafc"
          needleBaseColor="#64748b"
        />
      </div>
      <div className="text-center">
        <p className="font-mono text-5xl font-bold tracking-tight text-white tabular-nums">
          {Math.round(safe)}
        </p>
        <p className="mt-1 text-sm uppercase tracking-widest text-slate-400">km/h</p>
      </div>
    </div>
  );
}
