//src/components/StreamControls.tsx

'use client';
import { FiChevronDown, FiSettings } from 'react-icons/fi';
import Swal from 'sweetalert2';

interface StreamControlsProps {
  quality: string;
  onQualityChange: (quality: string) => void;
}

export default function StreamControls({ quality, onQualityChange }: StreamControlsProps) {
  const handleQualityChange = (newQuality: string) => {
    onQualityChange(newQuality);
    Swal.fire({
      title: 'Quality Changed',
      text: `Stream quality set to ${newQuality.toUpperCase()}`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  return (
    <div className="relative group">
      <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200">
        <FiSettings className="mr-2" />
        <span>Quality</span>
        <FiChevronDown className="ml-2 transition-transform group-hover:rotate-180" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          <button
            onClick={() => handleQualityChange('hd')}
            className={`flex w-full px-4 py-2 text-sm ${quality === 'hd' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <span className="mr-2">🎥</span> HD (720p)
          </button>
          <button
            onClick={() => handleQualityChange('sd')}
            className={`flex w-full px-4 py-2 text-sm ${quality === 'sd' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <span className="mr-2">📱</span> SD (480p)
          </button>
        </div>
      </div>
    </div>
  );
}