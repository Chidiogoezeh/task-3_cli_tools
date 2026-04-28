import http from "http";
import url from "url";

export const startCallbackServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const query = url.parse(req.url, true).query;
      
      if (query.code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Login Successful!</h1><p>You can close this window and return to the CLI.</p>");
        server.close();
        resolve(query); // Returns code and state
      } else {
        res.writeHead(400);
        res.end("Authentication failed.");
        reject(new Error("No code received"));
      }
    }).listen(port);
  });
};