const XRAY_HOST = "ip237.ip-51-255-9.eu";
const XRAY_PORT = 37899;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const target = `http://${XRAY_HOST}:${XRAY_PORT}${path}${url.search}`;

  const lines = [];
  lines.push(`target: ${target}`);
  lines.push(`cf colo: ${context.request.cf?.colo ?? "n/a"}`);

  const t0 = Date.now();
  try {
    const res = await fetch(target, {
      method: "GET",
      headers: {
        Host: XRAY_HOST,
        "User-Agent": "cf-worker-debug/1",
      },
      redirect: "manual",
    });
    lines.push(`ok: true`);
    lines.push(`status: ${res.status} ${res.statusText}`);
    lines.push(`elapsed_ms: ${Date.now() - t0}`);
    lines.push("--- response headers ---");
    res.headers.forEach((v, k) => lines.push(`${k}: ${v}`));
    const body = await res.text();
    lines.push("--- body (truncated) ---");
    lines.push(body.slice(0, 500));
  } catch (e) {
    lines.push(`ok: false`);
    lines.push(`elapsed_ms: ${Date.now() - t0}`);
    lines.push(`error: ${e?.name ?? "Error"}: ${e?.message ?? e}`);
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
