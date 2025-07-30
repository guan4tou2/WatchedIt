const fs = require("fs");
const path = require("path");

// 建立圖標目錄
const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 圖標尺寸列表
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 建立 SVG 圖標內容
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#3B82F6"/>
  <path d="M128 160C128 142.327 142.327 128 160 128H352C369.673 128 384 142.327 384 160V352C384 369.673 369.673 384 352 384H160C142.327 384 128 369.673 128 352V160Z" fill="white"/>
  <path d="M192 224L256 288L320 224" stroke="#3B82F6" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="32" fill="#3B82F6"/>
</svg>
`;

// 建立一個簡單的 HTML 文件來生成圖標
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Icon Generator</title>
</head>
<body>
  <div id="icons"></div>
  <script>
    const svg = \`${svgContent}\`;
    const sizes = [${sizes.join(", ")}];
    
    sizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, size, size);
        
        const link = document.createElement('a');
        link.download = \`icon-\${size}x\${size}.png\`;
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  </script>
</body>
</html>
`;

// 寫入 HTML 文件
const htmlPath = path.join(__dirname, "icon-generator.html");
fs.writeFileSync(htmlPath, htmlContent);

console.log("圖標生成器已建立:", htmlPath);
console.log("請在瀏覽器中打開此文件來生成圖標");
console.log("然後將生成的圖標移動到 public/icons/ 目錄");
