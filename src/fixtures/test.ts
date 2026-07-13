import { test as base } from '@playwright/test';
import { env } from '@config/env';
import { AppointmentApiClient } from '@helpers/api-client';
import { DbClient } from '@helpers/db-client';
import { AppointmentsPage } from '@pages/appointments.page';
import { BookingPage } from '@pages/booking.page';
import { LoginPage } from '@pages/login.page';

type QaFixtures = {
  apiClient: AppointmentApiClient;
  db: DbClient;
  loginPage: LoginPage;
  bookingPage: BookingPage;
  appointmentsPage: AppointmentsPage;
  authenticatedPatientToken: string;
};

export const test = base.extend<QaFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new AppointmentApiClient(request));
  },

  // Playwright fixtures require object destructuring as the first argument.
  // eslint-disable-next-line no-empty-pattern
  db: async ({}, use) => {
    const db = new DbClient();
    await use(db);
    await db.close();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  bookingPage: async ({ page }, use) => {
    await use(new BookingPage(page));
  },

  appointmentsPage: async ({ page }, use) => {
    await use(new AppointmentsPage(page));
  },

  authenticatedPatientToken: async ({ apiClient }, use) => {
    const token = await apiClient.login(env.patient);
    await use(token);
  }
});

export { expect } from '@playwright/test';
