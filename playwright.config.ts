import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const apiURL = process.env.API_URL ?? `${baseURL}/api`;

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    extraHTTPHeaders: {
      'x-qa-suite': 'appointment-booking-qa'
    }
  },
  metadata: {
    apiURL
  },
  projects: [
    {
      name: 'chromium-ui',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox-ui',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'mobile-ui',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { ...devices['Pixel 7'] }
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: apiURL
      }
    },
    {
      name: 'sql',
      testMatch: /.*\.sql\.spec\.ts/
    }
  ],
  outputDir: 'test-results/artifacts'
});
