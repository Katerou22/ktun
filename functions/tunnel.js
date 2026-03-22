const XRAY_HOST = "ip237.ip-51-255-9.eu";
const XRAY_PORT = 37899;

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // Forward everything to Xray preserving path + query + method + body
  const backendUrl = `http://${XRAY_HOST}:${XRAY_PORT}${url.pathname}${url.search}`;

  const headers = new Headers();
  // Only forward relevant headers, set Host correctly
  headers.set("Host", XRAY_HOST);
  headers.set("Content-Type", request.headers.get("Content-Type") || "application/octet-stream");

  // Forward xhttp specific headers
  for (const [k, v] of request.headers) {
    const lower = k.toLowerCase();
    if (lower.startsWith("x-") || lower === "content-length") {
      headers.set(k, v);
    }
  }

  try {
    const response = await fetch(backendUrl, {
      method:  request.method,
      headers: headers,
      body:    request.body,
    });

    return new Response(response.body, {
      status:  response.status,
      headers: response.headers,
    });
  } catch(e) {
    return new Response(`error: ${e.message}`, { status: 502 });
  }
}
