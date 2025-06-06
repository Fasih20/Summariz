// components/ViewersPanel.tsx

'use client';
import { FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ViewersPanelProps {
  count: number;
}

export default function ViewersPanel({ count }: ViewersPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center px-4 py-2 bg-black/80 backdrop-blur-md rounded-full shadow-lg"
    >
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mr-2"
      >
        <FaEye className="text-red-400" />
      </motion.div>
      <span className="text-sm font-medium text-white">
        <span className="font-bold">{count}</span> {count === 1 ? 'viewer' : 'viewers'}
      </span>
    </motion.div>
  );
}