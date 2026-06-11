addEventListener("fetch", function(event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      }
    });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target) return new Response("Missing url", { status: 400 });

  let origin = "";
  try { origin = new URL(target).origin; } catch(e) {}

  const resp = await fetch(target, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.7,en;q=0.5",
      "Referer": origin + "/",
      "Cache-Control": "no-cache",
    },
    redirect: "follow",
  });

  const body = await resp.arrayBuffer();
  return new Response(body, {
    status: resp.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": resp.headers.get("Content-Type") || "text/html",
    }
  });
}
