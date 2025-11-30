import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 移除硬編碼的路徑前綴
export function getBasePath() {
  return "";
}

export function getAssetPath() {
  return "";
}
