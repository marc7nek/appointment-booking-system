import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { TestUser } from '@config/env';
import type { ApiAppointmentPayload } from '@models/appointment';

export class AppointmentApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(user: TestUser): Promise<string> {
    const response = await this.request.post('/auth/login', {
      data: {
        email: user.email,
        password: user.password
      }
    });

    if (!response.ok()) {
      throw new Error(`Login failed with ${response.status()}: ${await response.text()}`);
    }

    const body = (await response.json()) as { token?: string; accessToken?: string };
    const token = body.accessToken ?? body.token;

    if (!token) {
      throw new Error('Login response does not contain token or accessToken');
    }

    return token;
  }

  async createAppointment(token: string, payload: ApiAppointmentPayload): Promise<APIResponse> {
    return this.request.post('/appointments', {
      headers: this.authHeaders(token),
      data: payload
    });
  }

  async getAppointment(token: string, appointmentId: string): Promise<APIResponse> {
    return this.request.get(`/appointments/${appointmentId}`, {
      headers: this.authHeaders(token)
    });
  }

  async cancelAppointment(token: string, appointmentId: string): Promise<APIResponse> {
    return this.request.patch(`/appointments/${appointmentId}/cancel`, {
      headers: this.authHeaders(token)
    });
  }

  async listAppointments(token: string): Promise<APIResponse> {
    return this.request.get('/appointments', {
      headers: this.authHeaders(token)
    });
  }

  private authHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`
    };
  }
}
