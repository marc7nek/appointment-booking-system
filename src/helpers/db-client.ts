import { Client, type QueryResultRow } from 'pg';
import { env } from '@config/env';

export class DbClient {
  private readonly client = new Client(env.db);
  private connected = false;

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  async query<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.connect();
    const result = await this.client.query<T>(sql, params);

    return result.rows;
  }

  async appointmentById(appointmentId: string): Promise<
    | {
        id: string;
        status: string;
        patient_email: string;
        starts_at: Date;
        cancelled_at: Date | null;
      }
    | undefined
  > {
    const rows = await this.query<{
      id: string;
      status: string;
      patient_email: string;
      starts_at: Date;
      cancelled_at: Date | null;
    }>(
      `
        SELECT a.id, a.status, u.email AS patient_email, a.starts_at, a.cancelled_at
        FROM appointments a
        JOIN users u ON u.id = a.patient_id
        WHERE a.id = $1
      `,
      [appointmentId]
    );

    return rows[0];
  }

  async close(): Promise<void> {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
    }
  }
}
