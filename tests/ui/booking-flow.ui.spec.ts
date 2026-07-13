import { env } from '@config/env';
import { uiAppointmentDraft } from '@helpers/test-data';
import { expect, test } from '@fixtures/test';

test.describe('UI | Rezerwowanie wizyt', () => {
  test('@smoke pacjent może zarezerwować wizytę', async ({ loginPage, bookingPage, page }) => {
    const appointment = uiAppointmentDraft();

    await loginPage.goto();
    await loginPage.login(env.patient);
    await expect(page).toHaveURL(/dashboard|appointments/);

    await bookingPage.goto();
    await bookingPage.bookAppointment(appointment);
    await bookingPage.expectBooked(appointment);
  });

  test('@regression pacjent może anulować najbliższą wizytę', async ({
    loginPage,
    bookingPage,
    appointmentsPage,
    page
  }) => {
    const appointment = uiAppointmentDraft();

    await loginPage.goto();
    await loginPage.login(env.patient);
    await expect(page).toHaveURL(/dashboard|appointments/);

    await bookingPage.goto();
    await bookingPage.bookAppointment(appointment);
    await bookingPage.expectBooked(appointment);

    await appointmentsPage.goto();
    await appointmentsPage.cancelFirstAppointment();
    await appointmentsPage.expectCancellationVisible();
  });

  test('@regression niepoprawne logowanie pokazuje komunikat błędu', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login({ email: 'wrong@example.com', password: 'bad-password' });
    await loginPage.expectLoginError();
  });
});
