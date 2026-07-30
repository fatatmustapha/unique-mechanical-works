import mysql, {
  type Pool,
  type PoolConnection,
  type RowDataPacket,
} from "mysql2/promise";

import { env } from "./env.js";

export const databasePool: Pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60_000,
  queueLimit: 0,

  charset: "utf8mb4",
  timezone: "Z",
  decimalNumbers: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

interface DatabaseVersionRow extends RowDataPacket {
  databaseName: string;
  databaseVersion: string;
}

export interface DatabaseHealth {
  databaseName: string;
  databaseVersion: string;
}

export const testDatabaseConnection = async (): Promise<DatabaseHealth> => {
  let connection: PoolConnection | undefined;

  try {
    connection = await databasePool.getConnection();

    const [rows] = await connection.query<DatabaseVersionRow[]>(
      `
        SELECT
          DATABASE() AS databaseName,
          VERSION() AS databaseVersion
      `,
    );

    const databaseInformation = rows[0];

    if (!databaseInformation) {
      throw new Error("The database test query returned no result.");
    }

    return {
      databaseName: databaseInformation.databaseName,
      databaseVersion: databaseInformation.databaseVersion,
    };
  } finally {
    connection?.release();
  }
};