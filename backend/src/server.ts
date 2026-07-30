import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `Unique Mechanical Works API is running at http://localhost:${env.PORT}`,
  );
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received. Shutting down gracefully.`);

  server.close((error) => {
    if (error) {
      console.error("The HTTP server could not close cleanly.");
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));