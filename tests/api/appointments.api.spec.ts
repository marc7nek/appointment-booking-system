import { apiAppointmentPayload } from '@helpers/test-data';
import { expect, test } from '@fixtures/test';

test.describe('API | Appointments', () => {
  test('@smoke tworzy i pobiera wizytę', async ({ apiClient, authenticatedPatientToken }) => {
    const createResponse = await apiClient.createAppointment(
      authenticatedPatientToken,
      apiAppointmentPayload()
    );

    expect(createResponse.status()).toBe(201);
    const created = (await createResponse.json()) as { id: string; status: string };
    expect(created.id).toBeTruthy();
    expect(created.status).toMatch(/booked|scheduled|confirmed/);

    const getResponse = await apiClient.getAppointment(authenticatedPatientToken, created.id);
    expect(getResponse.ok()).toBeTruthy();
    const appointment = (await getResponse.json()) as { id: string };
    expect(appointment.id).toBe(created.id);
  });

  test('@regression odrzuca próbę rezerwacji bez autoryzacji', async ({ apiClient }) => {
    const response = await apiClient.createAppointment('', apiAppointmentPayload());
    expect(response.status()).toBe(401);
  });

  test('@regression anuluje istniejącą wizytę', async ({
    apiClient,
    authenticatedPatientToken
  }) => {
    const createResponse = await apiClient.createAppointment(
      authenticatedPatientToken,
      apiAppointmentPayload()
    );
    expect(createResponse.status()).toBe(201);

    const created = (await createResponse.json()) as { id: string };
    const cancelResponse = await apiClient.cancelAppointment(authenticatedPatientToken, created.id);

    expect(cancelResponse.ok()).toBeTruthy();
    const cancelled = (await cancelResponse.json()) as { id: string; status: string };
    expect(cancelled.id).toBe(created.id);
    expect(cancelled.status).toMatch(/cancelled|canceled/);
  });
});
