import { expect, type Locator, type Page } from '@playwright/test';
import type { TestUser } from '@config/env';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(user: TestUser): Promise<void> {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.page.getByTestId('login-error')).toBeVisible();
  }
}
