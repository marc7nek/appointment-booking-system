import { expect, type Locator, type Page } from '@playwright/test';

export class AppointmentsPage {
  readonly appointmentCards: Locator;

  constructor(private readonly page: Page) {
    this.appointmentCards = page.getByTestId('appointment-card');
  }

  async goto(): Promise<void> {
    await this.page.goto('/appointments');
  }

  async cancelFirstAppointment(): Promise<void> {
    const firstAppointment = this.appointmentCards.first();
    await expect(firstAppointment).toBeVisible();
    await firstAppointment.getByTestId('cancel-appointment').click();
    await this.page.getByTestId('confirm-cancel-appointment').click();
  }

  async expectCancellationVisible(): Promise<void> {
    await expect(this.page.getByTestId('appointment-status').first()).toContainText(/cancelled|anulowana/i);
  }
}
