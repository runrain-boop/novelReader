# Novel Reader 本機代理
# 用途：有些網站（如半夏 xbanxia.cc）會擋 Cloudflare Worker 等資料中心 IP，
#       改由自己電腦的網路去抓，就跟用瀏覽器看一樣。
# 使用：python local-proxy.py   （視窗開著期間有效，Ctrl+C 結束）
# 格式：http://127.0.0.1:8787/?url=<網址>

import sys
import urllib.request
import urllib.error
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8787
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")


class Handler(BaseHTTPRequestHandler):
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        # Chrome 從 https 網頁連 localhost 時需要這個
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def reply(self, status, body, ctype="text/plain; charset=utf-8"):
        self.send_response(status)
        self.cors()
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        target = (q.get("url") or [""])[0]
        if not target:
            return self.reply(200, "novel-reader local proxy OK".encode())
        if urlparse(target).scheme not in ("http", "https"):
            return self.reply(400, b"bad url")
        p = urlparse(target)
        req = urllib.request.Request(target, headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.5",
            "Referer": f"{p.scheme}://{p.netloc}/",
        })
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                body = r.read()
                self.reply(r.status, body, r.headers.get("Content-Type", "text/html"))
        except urllib.error.HTTPError as e:
            self.reply(e.code, e.read() or str(e).encode())
        except Exception as e:
            self.reply(502, str(e).encode())

    def log_message(self, fmt, *args):
        sys.stdout.write("%s\n" % (fmt % args))


if __name__ == "__main__":
    print(f"Novel Reader 本機代理啟動：http://127.0.0.1:{PORT}/  （Ctrl+C 結束）")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
