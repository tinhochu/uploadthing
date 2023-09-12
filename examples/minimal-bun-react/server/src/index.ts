import { createServerHandler } from "uploadthing/server";

import { uploadRouter } from "./router";

const server = Bun.serve({
  port: 5174,
  fetch(request) {
    const reqPath = new URL(request.url).pathname;

    if (reqPath === "/api/uploadthing") {
      const handlers = createServerHandler({
        router: uploadRouter,
      });

      try {
        if (request.method === "GET") {
          return handlers.GET({ request });
        } else if (request.method === "POST") {
          return handlers.POST({ request });
        } else {
          return new Response("Method not allowed", {
            status: 405,
          });
        }
      } catch (e) {
        console.error(e);
        return new Response("Internal server error", {
          status: 500,
        });
      }
    }

    return new Response("No route matches that path", {
      status: 404,
    });
  },
});

console.log(`Bun server listening on http://localhost:${server.port}`);