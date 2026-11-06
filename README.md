# 小蝦辦公室 PWA 版

## 檔案
- `index.html`：應用程式本體（單檔，內含所有功能）
- `manifest.webmanifest`：安裝設定（名稱、圖示、啟動捷徑）
- `sw.js`：Service Worker（離線快取、通知點擊）
- `icons/`：App 圖示（192／512／maskable／SVG／iOS）

## 在電腦上試用（Chrome／Edge）
```
cd xiaoxia-office-pwa
python3 -m http.server 8080
```
開啟 http://localhost:8080 ，頂欄會出現「⬇ 安裝」。

## 手機安裝
PWA 在手機上需要 **https**。把整個資料夾放到任一靜態網站即可（GitHub Pages、Netlify、Cloudflare Pages 皆可）：
- Android Chrome：選單 →「安裝應用程式」
- iPhone／iPad：Safari →「分享」→「加入主畫面」

## 更新版本
修改 `index.html` 後，把 `sw.js` 第一行的 `VERSION` 改成新字串；使用者下次開啟會收到更新提示。

## 注意
- 直接用 `file://` 開 `index.html` 仍可使用全部功能，但無法安裝與離線快取。
- 排程只在頁面（或已安裝的 App 視窗）開著時執行；瀏覽器不允許網頁在完全關閉後於背景跑流程。
- 資料（設定、虛擬工作區）存在各裝置的瀏覽器儲存空間，不會跨裝置同步；請用「設定 → 匯出 JSON」搬移。
