import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert backend avatar URL (relative or absolute) ke full src yang bisa dipakai di <img> */
export function getAvatarSrc(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `http://localhost:5000${url}`
}
