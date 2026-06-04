import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn-ui 标配 cn 工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
