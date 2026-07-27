addEventListener("fetch", function(event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, POST, PATCH",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Notion-Version",
      }
    });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target) return new Response("Missing url", { status: 400 });

  let origin = "";
  try { origin = new URL(target).origin; } catch(e) {}

  const isGitHub = target.includes("api.github.com");
  const isNotion = target.includes("api.notion.com");

  let fetchOptions;
  if (isGitHub) {
    const headers = {
      "User-Agent": "novelreader-sync/1.0",
      "Accept": "application/vnd.github.v3+json",
    };
    const auth = request.headers.get("Authorization");
    const ct = request.headers.get("Content-Type");
    if (auth) headers["Authorization"] = auth;
    if (ct) headers["Content-Type"] = ct;

    fetchOptions = { method: request.method, headers };
    if (request.method === "PUT") fetchOptions.body = await request.text();
  } else if (isNotion) {
    const headers = {};
    const auth = request.headers.get("Authorization");
    const ct = request.headers.get("Content-Type");
    const nv = request.headers.get("Notion-Version");
    if (auth) headers["Authorization"] = auth;
    if (ct) headers["Content-Type"] = ct;
    headers["Notion-Version"] = nv || "2022-06-28";

    fetchOptions = { method: request.method, headers };
    if (request.method === "POST" || request.method === "PATCH") {
      fetchOptions.body = await request.text();
    }
  } else {
    fetchOptions = {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.7,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": origin + "/",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
    };
  }

  const resp = await fetch(target, fetchOptions);
  const body = await resp.arrayBuffer();

  return new Response(body, {
    status: resp.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": resp.headers.get("Content-Type") || (isGitHub ? "application/json" : "text/html"),
    }
  });
}
