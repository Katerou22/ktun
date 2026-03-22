const XRAY_HOST = "ip237.ip-51-255-9.eu";
const XRAY_PORT = 37899;

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  const backendUrl = `http://${XRAY_HOST}:${XRAY_PORT}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("Host", XRAY_HOST);
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.delete("cdn-loop");
  headers.delete("cf-worker");
  headers.delete("x-forwarded-proto");

  const response = await fetch(backendUrl, {
    method:  request.method,
    headers: headers,
    body:    ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
  });

  return new Response(response.body, {
    status:  response.status,
    headers: response.headers,
  });
}
