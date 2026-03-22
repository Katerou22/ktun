const XRAY_HOST = "ip237.ip-51-255-9.eu";
const XRAY_PORT = 37899;

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const backendUrl = `http://${XRAY_HOST}:${XRAY_PORT}${url.pathname}${url.search}`;

  // Build clean headers — strip all Cloudflare headers
  const headers = new Headers();
  headers.set("Host", XRAY_HOST);

  for (const [k, v] of request.headers) {
    const lower = k.toLowerCase();
    if (lower.startsWith("cf-") ||
        lower.startsWith("cdn-") ||
        lower === "x-forwarded-for" ||
        lower === "x-forwarded-proto" ||
        lower === "x-real-ip") continue;
    headers.set(k, v);
  }

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    });

    return new Response(response.body, {
      status:  response.status,
      headers: response.headers,
    });
  } catch(e) {
    return new Response(`error: ${e.message}`, { status: 502 });
  }
}
