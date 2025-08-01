# Favicon 設置指南

## 📋 概述

WatchedIt 應用程式現在使用新的品牌圖標系統。本文檔說明如何完成 favicon.ico 的設置。

## 🎨 新的圖標設計

新的圖標包含以下元素：
- **眼睛圖標**：代表「觀看」和「追蹤」
- **勾選標記**：代表「完成」和「已觀看」
- **漸層背景**：藍紫色到紫色的現代漸層
- **品牌色彩**：與應用程式整體設計保持一致

## 📁 已生成的文件

### SVG 圖標
- `public/icons/icon-16x16.svg` - 16x16 像素
- `public/icons/icon-32x32.svg` - 32x32 像素
- `public/icons/icon-48x48.svg` - 48x48 像素
- `public/icons/icon-72x72.svg` - 72x72 像素
- `public/icons/icon-96x96.svg` - 96x96 像素
- `public/icons/icon-128x128.svg` - 128x128 像素
- `public/icons/icon-144x144.svg` - 144x144 像素
- `public/icons/icon-152x152.svg` - 152x152 像素
- `public/icons/icon-192x192.svg` - 192x192 像素
- `public/icons/icon-384x384.svg` - 384x384 像素
- `public/icons/icon-512x512.svg` - 512x512 像素

### Favicon 文件
- `public/favicon.svg` - SVG 格式的 favicon

## 🔧 轉換步驟

### 方法一：使用在線工具

1. **下載 SVG 文件**
   - 訪問 `http://localhost:3000/convert-favicon.html`
   - 下載 `icon-512x512.svg` 文件

2. **轉換為 ICO 格式**
   - 使用 [Convertio.co](https://convertio.co/svg-ico/)
   - 或使用 [Favicon Generator](https://www.favicon-generator.org/)
   - 或使用 [RealFaviconGenerator](https://realfavicongenerator.net/)

3. **替換現有文件**
   - 將生成的 `favicon.ico` 文件放到 `frontend/public/` 目錄
   - 覆蓋現有的 `favicon.ico` 文件

### 方法二：使用命令行工具

如果您有 ImageMagick 安裝：

```bash
# 安裝 ImageMagick (macOS)
brew install imagemagick

# 轉換 SVG 為 ICO
convert public/icons/icon-512x512.svg public/favicon.ico
```

### 方法三：使用 Node.js 腳本

```bash
# 安裝 svg2png 和 png2icons
npm install -g svg2png png2icons

# 轉換 SVG 為 PNG
svg2png public/icons/icon-512x512.svg public/icons/icon-512x512.png

# 轉換 PNG 為 ICO
png2icons public/icons/icon-512x512.png public/favicon.ico
```

## 🎯 推薦設置

### 最佳實踐
1. **使用 512x512 版本**：包含最多細節，可生成高質量圖標
2. **包含多個尺寸**：ICO 文件應包含 16x16, 32x32, 48x48 尺寸
3. **文件大小**：確保 favicon.ico 小於 100KB
4. **測試兼容性**：在不同瀏覽器中測試

### 瀏覽器支持
- **Chrome/Edge**：支持 SVG 和 ICO
- **Firefox**：支持 SVG 和 ICO
- **Safari**：支持 SVG 和 ICO
- **移動瀏覽器**：支持 SVG 格式

## 📝 驗證步驟

1. **清除瀏覽器快取**
2. **重新載入頁面**
3. **檢查瀏覽器標籤頁**
4. **檢查書籤圖標**
5. **測試 PWA 安裝**

## 🔍 故障排除

### 常見問題

**Q: 圖標沒有更新？**
A: 清除瀏覽器快取並強制重新載入 (Ctrl+F5)

**Q: SVG 圖標不顯示？**
A: 確保伺服器正確設置 MIME 類型為 `image/svg+xml`

**Q: ICO 文件太大？**
A: 使用在線工具優化，或減少包含的尺寸數量

**Q: 移動設備圖標不顯示？**
A: 檢查 manifest.json 中的圖標路徑是否正確

## 📞 支援

如果遇到問題，請：
1. 檢查瀏覽器開發者工具的控制台錯誤
2. 確認文件路徑正確
3. 驗證文件格式和大小
4. 測試不同瀏覽器

## 🎨 自定義

如需自定義圖標：
1. 修改 `scripts/generate-favicon.js`
2. 調整顏色、尺寸或設計
3. 重新運行生成腳本
4. 更新相關文件

---

**注意**：完成 favicon.ico 轉換後，請刪除 `convert-favicon.html` 文件，因為它只是用於開發階段。 