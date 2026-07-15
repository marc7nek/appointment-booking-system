# Appointment Booking QA Automation

End-to-end QA automation project for an appointment booking web application, built with **Playwright**, **TypeScript**, **API testing**, **SQL** validation, and **GitHub Actions**.

The repository includes both a complete automated test suite and a lightweight local demo application, so the project can be cloned and run without connecting it to an external system first.

![Web application screenshot](app.png)
![Playwright execution report screenshot](report.png)

## Highlights

- Cross-browser UI tests with Playwright: Chromium, Firefox, and mobile viewport.
- Page Object Model for maintainable E2E test structure.
- API tests using Playwright `APIRequestContext`.
- SQL/data-integrity checks with support for a local demo mode or PostgreSQL.
- Environment-driven configuration for local, staging, and CI runs.
- HTML and JUnit reports, screenshots, traces, and videos on failure.
- GitHub Actions workflow for quality gates and automated test execution.
- Local demo appointment booking app included for hands-on test runs.

## Tech Stack

- Playwright
- TypeScript
- Node.js
- PostgreSQL client (`pg`)
- ESLint and Prettier
- GitHub Actions

## Test Coverage

The suite covers the core appointment booking flow:

- Patient login
- Appointment booking
- Appointment cancellation
- Invalid login validation
- Appointment API creation, retrieval, and cancellation
- Unauthorized API request handling
- Data integrity checks for created and cancelled appointments

## Getting Started

Install dependencies and Playwright browsers:

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
```

Start the local demo application:

```bash
npm run dev
```

The app will be available at:

```text
http://127.0.0.1:3000
```

The API will be available at:

```text
http://127.0.0.1:3000/api
```

In a second terminal, run the tests:

```bash
npm test
```

## Demo Credentials

```text
Email: qa.patient@example.com
Password: ChangeMe123!
```

## Useful Commands

```bash
npm run dev              # Start the local demo app
npm test                 # Run the full test suite
npm run test:smoke       # Run smoke tests
npm run test:ui          # Run UI tests
npm run test:api         # Run API tests
npm run test:sql         # Run SQL/data checks
npm run test:headed      # Run tests with a visible browser
npm run test:debug       # Run tests in Playwright debug mode
npm run report           # Open the HTML report
npm run typecheck        # Run TypeScript validation
npm run lint             # Run ESLint
```

## Environment Configuration

Copy `.env.example` to `.env` and adjust values as needed.

```env
BASE_URL=http://127.0.0.1:3000
API_URL=http://127.0.0.1:3000/api

QA_PATIENT_EMAIL=qa.patient@example.com
QA_PATIENT_PASSWORD=ChangeMe123!

DB_PROVIDER=demo
```

Use `DB_PROVIDER=demo` for the included local application. Use `DB_PROVIDER=postgres` when validating against a real PostgreSQL database.

## Required UI Selectors

The UI tests rely on stable `data-testid` attributes, for example:

- `email-input`, `password-input`, `login-submit`
- `service-select`, `provider-select`, `date-input`, `time-slot`, `booking-submit`
- `booking-confirmation`, `appointment-card`, `cancel-appointment`

If the target application uses different selectors, update the Page Object files in `src/pages`.

## Project Structure

```text
demo-app/              Local demo appointment booking app
src/
  config/              Environment configuration
  fixtures/            Extended Playwright fixtures
  helpers/             API client, DB client, and test data
  pages/               Page Object Model classes
  types/               Shared TypeScript types
tests/
  api/                 API test scenarios
  sql/                 Data integrity scenarios
  ui/                  End-to-end UI scenarios
.github/workflows/    GitHub Actions workflow
```

## CI

The GitHub Actions workflow runs:

- dependency installation
- TypeScript validation
- linting
- Playwright test suites
- report artifact upload

Secrets such as `BASE_URL`, `API_URL`, test credentials, and database settings can be configured in GitHub repository settings when running against a deployed environment.
