import WorkDetailClient from "./WorkDetailClient";

// 為靜態導出生成參數
export async function generateStaticParams() {
  // 返回一個空的陣列，因為我們無法預知所有可能的 ID
  // 這將在運行時動態處理
  return [];
}

export default function WorkDetailPage() {
  return <WorkDetailClient />;
}
