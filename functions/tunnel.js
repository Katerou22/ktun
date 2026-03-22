const XRAY_HOST = "ip237.ip-51-255-9.eu";
const XRAY_PORT = 37899;

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // Forward everything to Xray, preserving path + query
  const backendUrl = `http://${XRAY_HOST}:${XRAY_PORT}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("Host", `${XRAY_HOST}:${XRAY_PORT}`);

  const response = await fetch(backendUrl, {
    method:  request.method,
    headers: headers,
    body:    request.body,
  });

  return new Response(response.body, {
    status:  response.status,
    headers: response.headers,
  });
}
