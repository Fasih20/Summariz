// components/StatsPanel.tsx
'use client';

interface StatsPanelProps {
  stats: {
    bitrate: number;
    resolution: string;
    fps: number;
  };
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="flex gap-4 text-sm text-gray-300">
      <div className="bg-gray-800/80 px-3 py-1 rounded-full">
        {stats.resolution}
      </div>
      <div className="bg-gray-800/80 px-3 py-1 rounded-full">
        {stats.fps.toFixed(0)} FPS
      </div>
      <div className="bg-gray-800/80 px-3 py-1 rounded-full">
        {(stats.bitrate / 1000).toFixed(1)} Mbps
      </div>
    </div>
  );
}