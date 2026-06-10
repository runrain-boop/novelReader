# Novel Reader 專案說明

## 專案資訊
- 主檔案：novel-reader.html
- 部署網址：https://runrain-boop.github.io/novelReader/novel-reader.html
- GitHub：https://github.com/runrain-boop/novelReader.git

## 修改規則
每次修改 novel-reader.html 完成後，自動執行：
git add novel-reader.html && git commit -m "update" && git push

## 技術說明
- 單一 HTML 檔案，所有 CSS / JS 內嵌
- 不依賴任何外部框架
- Cloudflare Worker proxy：https://novel-proxy.runrain.workers.dev/
- localStorage key：nr8
- 資料結構：G.library（書庫）、G.read（閱讀進度）、G.cur（當前書）、G.idx（當前章節）

## 常見修改方式
當 Rainrain 描述要改的功能，直接修改 novel-reader.html 對應的 CSS 或 JS 區塊，
不要重寫整個檔案，用最小範圍的修改完成需求。
