import app from "./app.js";
import {
  databasePool,
  testDatabaseConnection,
} from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  try {
    const database = await testDatabaseConnection();

    console.log(
      `Connected to database "${database.databaseName}" using MariaDB/MySQL ${database.databaseVersion}.`,
    );

    const server = app.listen(env.PORT, () => {
      console.log(
        `Unique Mechanical Works API is running at http://localhost:${env.PORT}`,
      );
    });

    const shutdown = (signal: string): void => {
      console.log(`${signal} received. Shutting down gracefully.`);

      server.close((serverError) => {
        if (serverError) {
          console.error("The HTTP server could not close cleanly.");
          process.exitCode = 1;
        }

        void databasePool.end().finally(() => {
          process.exit();
        });
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error: unknown) {
    console.error("The backend could not connect to the database.");

    if (env.NODE_ENV === "development") {
      console.error(error);
    }

    await databasePool.end();
    process.exit(1);
  }
};

void startServer();