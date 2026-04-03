import { useSpeedData } from './hooks/useSpeedData.js';
import { ConnectionStatus } from './components/ConnectionStatus.jsx';
import { SpeedGauge } from './components/SpeedGauge.jsx';
import { SpeedHistoryChart } from './components/SpeedHistoryChart.jsx';

export default function App() {
  const { currentSpeed, history, connection, lastError, retry } = useSpeedData();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Real-time Speedometer
        </h1>
        
      </header>

      <ConnectionStatus connection={connection} lastError={lastError} onRetry={retry} />

      <main className="flex flex-col gap-10 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 shadow-xl backdrop-blur sm:p-10">
        <SpeedGauge speed={currentSpeed} />
        <SpeedHistoryChart history={history} />
      </main>

     
    </div>
  );
}
