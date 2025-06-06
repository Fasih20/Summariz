import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts

export function generateStreamId(): string {
  return `stream_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateShareableLink(streamId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/stream/${streamId}`;
  }
  return `http://localhost:3000/stream/${streamId}`; // Fallback for SSR
}

export function formatViewerCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}