import { env } from '@config/env';
import { apiAppointmentPayload } from '@helpers/test-data';
import { expect, test } from '@fixtures/test';

test.describe('SQL | Integralność danych rezerwacji', () => {
  test('@regression zapisuje utworzoną wizytę z poprawnym pacjentem i statusem', async ({
    apiClient,
    authenticatedPatientToken,
    db
  }) => {
    const createResponse = await apiClient.createAppointment(
      authenticatedPatientToken,
      apiAppointmentPayload()
    );
    expect(createResponse.status()).toBe(201);

    const created = (await createResponse.json()) as { id: string };
    const appointment = await db.appointmentById(created.id);

    expect(appointment).toBeDefined();
    expect(appointment?.patient_email).toBe(env.patient.email);
    expect(appointment?.status).toMatch(/booked|scheduled|confirmed/);
    expect(appointment?.starts_at).toBeInstanceOf(Date);
  });

  test('@regression anulowana wizyta ma status i datę anulowania w bazie', async ({
    apiClient,
    authenticatedPatientToken,
    db
  }) => {
    const createResponse = await apiClient.createAppointment(
      authenticatedPatientToken,
      apiAppointmentPayload()
    );
    expect(createResponse.status()).toBe(201);

    const created = (await createResponse.json()) as { id: string };
    const cancelResponse = await apiClient.cancelAppointment(authenticatedPatientToken, created.id);
    expect(cancelResponse.ok()).toBeTruthy();

    const appointment = await db.appointmentById(created.id);
    expect(appointment?.status).toMatch(/cancelled|canceled/);
    expect(appointment?.cancelled_at).toBeInstanceOf(Date);
  });
});
