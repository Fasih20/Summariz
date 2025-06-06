// components/StreamQualitySelector.tsx
'use client';

interface StreamQualitySelectorProps {
  quality: string;
  onChange: (quality: string) => void;
}

export default function StreamQualitySelector({ quality, onChange }: StreamQualitySelectorProps) {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={() => onChange('auto')}
        className={`px-4 py-2 text-sm font-medium ${
          quality === 'auto'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-gray-200 rounded-l-lg`}
      >
        Auto
      </button>
      <button
        type="button"
        onClick={() => onChange('hd')}
        className={`px-4 py-2 text-sm font-medium ${
          quality === 'hd'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border-t border-b border-gray-200`}
      >
        HD
      </button>
      <button
        type="button"
        onClick={() => onChange('sd')}
        className={`px-4 py-2 text-sm font-medium ${
          quality === 'sd'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-gray-200 rounded-r-md`}
      >
        SD
      </button>
    </div>
  );
}