const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const backendOrigin = new URL(BACKEND_URL);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendFile(filePath, response) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    response.end(content);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function proxyApiRequest(clientRequest, clientResponse) {
  const transport = backendOrigin.protocol === "https:" ? https : http;

  const proxyRequest = transport.request(
    {
      protocol: backendOrigin.protocol,
      hostname: backendOrigin.hostname,
      port: backendOrigin.port || (backendOrigin.protocol === "https:" ? 443 : 80),
      method: clientRequest.method,
      path: clientRequest.url,
      headers: {
        ...clientRequest.headers,
        host: backendOrigin.host
      }
    },
    (proxyResponse) => {
      clientResponse.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(clientResponse);
    }
  );

  proxyRequest.on("error", (error) => {
    sendJson(clientResponse, 502, {
      success: false,
      message:
        "Cannot reach backend at " +
        BACKEND_URL +
        ". Make sure the API server is running.",
      error: error.message
    });
  });

  clientRequest.pipe(proxyRequest);
}

http
  .createServer((request, response) => {
    const requestUrl = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`
    );

    if (requestUrl.pathname.startsWith("/api/")) {
      proxyApiRequest(request, response);
      return;
    }

    const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const safePath = path.normalize(pathname);
    const filePath = path.join(ROOT, safePath);

    if (!filePath.startsWith(ROOT)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(filePath, response);
        return;
      }

      sendFile(path.join(ROOT, "index.html"), response);
    });
  })
  .listen(PORT, () => {
    console.log(`Warehouse frontend running at http://localhost:${PORT}`);
    console.log(`Proxying API requests to ${BACKEND_URL}`);
  });
