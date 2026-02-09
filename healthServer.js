const http = require("http");
const { URL } = require("url");

const port = Number.parseInt(process.env.HEALTH_PORT || "3001", 10);
const businessUrl = process.env.BUSINESS_URL || "http://localhost:3000";

const handler = async (_req, res) => {
  try {
    const url = new URL("/api/health", businessUrl);
    const healthResponse = await fetch(url);

    if (!healthResponse.ok) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: false,
          message: "not business server, iva doesnt work",
        })
      );
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: false,
        message: "not business server, iva doesnt work",
      })
    );
  }
};

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    handler(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Health server running on http://localhost:${port}`);
});
