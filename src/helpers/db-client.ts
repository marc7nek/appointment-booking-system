import { Client, type QueryResultRow } from 'pg';
import { env } from '@config/env';

type AppointmentRow = {
  id: string;
  status: string;
  patient_email: string;
  starts_at: Date;
  cancelled_at: Date | null;
};

export class DbClient {
  private readonly client = env.dbProvider === 'postgres' ? new Client(env.db) : undefined;
  private connected = false;

  async connect(): Promise<void> {
    if (this.client && !this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  async query<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (!this.client) {
      throw new Error('Raw SQL query is available only when DB_PROVIDER=postgres');
    }

    await this.connect();
    const result = await this.client.query<T>(sql, params);

    return result.rows;
  }

  async appointmentById(appointmentId: string): Promise<AppointmentRow | undefined> {
    if (env.dbProvider === 'demo') {
      const response = await fetch(`${env.apiUrl}/__debug/appointments/${appointmentId}`);

      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error(`Demo DB lookup failed with ${response.status}: ${await response.text()}`);
      }

      const row = (await response.json()) as Omit<AppointmentRow, 'starts_at' | 'cancelled_at'> & {
        starts_at: string;
        cancelled_at: string | null;
      };

      return {
        ...row,
        starts_at: new Date(row.starts_at),
        cancelled_at: row.cancelled_at ? new Date(row.cancelled_at) : null
      };
    }

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
    if (this.client && this.connected) {
      await this.client.end();
      this.connected = false;
    }
  }
}
