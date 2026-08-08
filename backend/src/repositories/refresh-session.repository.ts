import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { databasePool } from "../config/database.js";
import type { AccountType } from "../types/auth.js";

interface RefreshSessionRow extends RowDataPacket {
  session_id: number;
  account_type: AccountType;
  customer_id: number | null;
  admin_id: number | null;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

export interface CreateRefreshSessionData {
  accountType: AccountType;
  accountId: number;
  tokenHash: string;
  expiresAt: Date;
}

const insertRefreshSession = async (
  connection: PoolConnection,
  data: CreateRefreshSessionData,
): Promise<void> => {
  const customerId =
    data.accountType === "customer" ? data.accountId : null;

  const adminId =
    data.accountType === "admin" ? data.accountId : null;

  await connection.execute<ResultSetHeader>(
    `
      INSERT INTO refresh_sessions (
        account_type,
        customer_id,
        admin_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.accountType,
      customerId,
      adminId,
      data.tokenHash,
      data.expiresAt,
    ],
  );
};

export const createRefreshSession = async (
  data: CreateRefreshSessionData,
): Promise<void> => {
  const connection = await databasePool.getConnection();

  try {
    await insertRefreshSession(connection, data);
  } finally {
    connection.release();
  }
};

export const rotateRefreshSession = async (
  oldTokenHash: string,
  newSession: CreateRefreshSessionData,
): Promise<boolean> => {
  const connection = await databasePool.getConnection();

  try {
    await connection.beginTransaction();

    const customerId =
      newSession.accountType === "customer"
        ? newSession.accountId
        : null;

    const adminId =
      newSession.accountType === "admin"
        ? newSession.accountId
        : null;

    const [rows] = await connection.execute<RefreshSessionRow[]>(
      `
        SELECT
          session_id,
          account_type,
          customer_id,
          admin_id,
          token_hash,
          expires_at,
          revoked_at
        FROM refresh_sessions
        WHERE token_hash = ?
          AND account_type = ?
          AND (
            (? = 'customer' AND customer_id = ? AND admin_id IS NULL)
            OR
            (? = 'admin' AND admin_id = ? AND customer_id IS NULL)
          )
          AND revoked_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1
        FOR UPDATE
      `,
      [
        oldTokenHash,
        newSession.accountType,
        newSession.accountType,
        customerId,
        newSession.accountType,
        adminId,
      ],
    );

    const existingSession = rows[0];

    if (!existingSession) {
      await connection.rollback();
      return false;
    }

    await connection.execute<ResultSetHeader>(
      `
        UPDATE refresh_sessions
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `,
      [existingSession.session_id],
    );

    await insertRefreshSession(connection, newSession);

    await connection.commit();

    return true;
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const revokeRefreshSession = async (
  tokenHash: string,
): Promise<void> => {
  await databasePool.execute<ResultSetHeader>(
    `
      UPDATE refresh_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = ?
        AND revoked_at IS NULL
    `,
    [tokenHash],
  );
};