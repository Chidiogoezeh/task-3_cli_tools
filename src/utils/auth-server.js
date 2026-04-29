import http from "http";
import url from "url";

export const startCallbackServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const query = url.parse(req.url, true).query;
      
      if (query.accessToken) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Login Successful! You can close this window and return to the CLI.");
        server.close();
        resolve(query); // Returns the actual tokens: accessToken, refreshToken, etc.
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Authentication failed: No tokens received.");
        server.close();
        reject(new Error("No tokens received"));
      }
    }).listen(port);
  });
};