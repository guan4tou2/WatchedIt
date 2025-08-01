const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// SVG 內容（與 favicon.svg 相同的設計，但調整為 512x512）
const svgContent = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color: #667eea; stop-opacity: 1" />
      <stop offset="100%" style="stop-color: #764ba2; stop-opacity: 1" />
    </linearGradient>
    <linearGradient id="faviconIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color: #ffffff; stop-opacity: 1" />
      <stop offset="100%" style="stop-color: #f0f0f0; stop-opacity: 1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <circle cx="256" cy="256" r="240" fill="url(#faviconGradient)" stroke="#4c5777" stroke-width="8" />

  <!-- Main eye icon representing "watched" -->
  <g transform="translate(256, 224)">
    <!-- Eye outline -->
    <ellipse cx="0" cy="0" rx="80" ry="48" fill="url(#faviconIconGradient)" stroke="#4c5777" stroke-width="8" />
    <!-- Pupil -->
    <circle cx="0" cy="0" r="24" fill="#4c5777" />
    <!-- Highlight -->
    <circle cx="-8" cy="-8" r="8" fill="#ffffff" opacity="0.8" />
  </g>

  <!-- Checkmark indicating completion -->
  <g transform="translate(256, 320)">
    <circle cx="0" cy="0" r="32" fill="#10b981" stroke="#ffffff" stroke-width="8" />
    <path d="M-12.8,0 L-4.8,9.6 L12.8,-12.8" stroke="#ffffff" stroke-width="12.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

// 需要生成的尺寸
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log("開始生成 PNG 圖示...");

async function generateIcons() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // 設定 HTML 內容
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background: transparent;
            }
            svg {
              width: 100%;
              height: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    await page.setContent(html);

    for (const size of sizes) {
      // 設定視窗大小
      await page.setViewport({ width: size, height: size });

      // 截圖
      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: size, height: size },
        type: "png",
      });

      // 儲存檔案
      const outputPath = path.join(
        __dirname,
        "../public/icons",
        `icon-${size}x${size}.png`
      );
      fs.writeFileSync(outputPath, screenshot);
      console.log(`✅ 已生成 icon-${size}x${size}.png`);
    }

    console.log("🎉 所有圖示生成完成！");
  } catch (error) {
    console.error("❌ 生成圖示時發生錯誤:", error);
  } finally {
    await browser.close();
  }
}

generateIcons();
