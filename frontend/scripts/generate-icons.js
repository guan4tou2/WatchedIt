const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 創建一個簡單的 SVG 圖標
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3B82F6"/>
  <path d="M128 160C128 142.327 142.327 128 160 128H352C369.673 128 384 142.327 384 160V352C384 369.673 369.673 384 352 384H160C142.327 384 128 369.673 128 352V160Z" fill="white"/>
  <path d="M192 224L256 288L320 224" stroke="#3B82F6" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="32" fill="#3B82F6"/>
</svg>
`;

function generateIcon(size) {
  const iconPath = path.join(
    __dirname,
    "../public/icons",
    `icon-${size}x${size}.png`
  );

  // 創建一個簡單的 base64 編碼的圖片（藍色背景）
  const iconBase64 = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  
  const buffer = Buffer.from(iconBase64, "base64");
  fs.writeFileSync(iconPath, buffer);

  console.log(`Generated icon-${size}x${size}.png`);
}

// 生成所有圖標
sizes.forEach((size) => {
  generateIcon(size);
});

console.log("All icons generated successfully!");
console.log("Note: These are placeholder icons. For production, use proper image generation tools.");
