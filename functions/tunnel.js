export async function onRequest(context) {
  try {
    const r = await fetch("https://httpbin.org/get");
    const data = await r.json();
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "content-type": "application/json" }
    });
  } catch(e) {
    return new Response(`error: ${e.message}`, { status: 502 });
  }
}
