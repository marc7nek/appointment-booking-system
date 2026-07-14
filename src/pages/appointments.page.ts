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
    const cancelButton = this.page.getByTestId('cancel-appointment').first();
    await expect(cancelButton).toBeVisible();
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await cancelButton.click();
  }

  async expectCancellationVisible(): Promise<void> {
    await expect(
      this.page.getByTestId('appointment-status').filter({ hasText: /cancelled/i }).first()
    ).toBeVisible();
  }
}
