import { expect, type Locator, type Page } from '@playwright/test';
import type { AppointmentDraft } from '@models/appointment';

export class BookingPage {
  readonly serviceSelect: Locator;
  readonly providerSelect: Locator;
  readonly dateInput: Locator;
  readonly noteInput: Locator;
  readonly submitButton: Locator;
  readonly confirmation: Locator;

  constructor(private readonly page: Page) {
    this.serviceSelect = page.getByTestId('service-select');
    this.providerSelect = page.getByTestId('provider-select');
    this.dateInput = page.getByTestId('date-input');
    this.noteInput = page.getByTestId('patient-note');
    this.submitButton = page.getByTestId('booking-submit');
    this.confirmation = page.getByTestId('booking-confirmation');
  }

  async goto(): Promise<void> {
    await this.page.goto('/appointments/new');
  }

  async bookAppointment(appointment: AppointmentDraft): Promise<void> {
    await this.serviceSelect.selectOption({ label: appointment.serviceName });
    await this.providerSelect.selectOption({ label: appointment.providerName });
    await this.dateInput.fill(appointment.date);
    await this.page.getByTestId('time-slot').filter({ hasText: appointment.time }).click();

    if (appointment.patientNote) {
      await this.noteInput.fill(appointment.patientNote);
    }

    await this.submitButton.click();
  }

  async expectBooked(appointment: AppointmentDraft): Promise<void> {
    await expect(this.confirmation).toBeVisible();
    await expect(this.confirmation).toContainText(appointment.serviceName);
    await expect(this.confirmation).toContainText(appointment.time);
  }
}
