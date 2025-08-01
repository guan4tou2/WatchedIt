import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 生產環境 basePath 處理
export function getBasePath(): string {
  if (typeof window !== "undefined") {
    // 客戶端環境
    return process.env.NODE_ENV === "production" ? "/WatchedIt" : "";
  }
  // 服務器端環境
  return process.env.NODE_ENV === "production" ? "/WatchedIt" : "";
}

export function getFullPath(path: string): string {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}
