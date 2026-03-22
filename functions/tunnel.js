const XRAY_HOST = "51.255.9.237";
const XRAY_PORT = 37899;
const XRAY_PATH = "/chats";

export async function onRequest(context) {
  const request = context.request;

  // Cloudflare Pages passes WebSocket upgrade differently
  // Check both header variations
  const upgrade = request.headers.get("Upgrade") ||
                  request.headers.get("upgrade") || "";

  const isWebSocket = upgrade.toLowerCase() === "websocket" ||
                      request.headers.get("sec-websocket-key") !== null ||
                      request.headers.get("Sec-WebSocket-Key") !== null;

  if (!isWebSocket) {
    return new Response(`upgrade: ${upgrade} | ws-key: ${request.headers.get("sec-websocket-key")}`, {
      headers: { "content-type": "text/plain" }
    });
  }

  const { 0: client, 1: worker } = new WebSocketPair();
  worker.accept();

  const backendResponse = await fetch(`http://${XRAY_HOST}:${XRAY_PORT}${XRAY_PATH}`, {
    method: "GET",
    headers: {
      "Upgrade":               "websocket",
      "Connection":            "Upgrade",
      "Sec-WebSocket-Version": "13",
      "Sec-WebSocket-Key":     btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))),
      "Host":                  XRAY_HOST,
    },
  });

  const backend = backendResponse.webSocket;
  backend.accept();

  worker.addEventListener("message",  (e) => backend.send(e.data));
  backend.addEventListener("message", (e) => worker.send(e.data));
  worker.addEventListener("close",    (e) => backend.close(e.code, e.reason));
  backend.addEventListener("close",   (e) => worker.close(e.code, e.reason));
  worker.addEventListener("error",    () => backend.close());
  backend.addEventListener("error",   () => worker.close());

  return new Response(null, { status: 101, webSocket: client });
}
