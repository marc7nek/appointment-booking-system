# Appointment Booking QA

Kompleksowy projekt automatyzacji testów dla aplikacji webowej do rezerwowania wizyt.

## Zakres

- UI E2E w Playwright z Page Object Model.
- Testy API przez `APIRequestContext`.
- Testy SQL dla integralności danych w PostgreSQL.
- Dane testowe, helpery i konfiguracja przez zmienne środowiskowe.
- Raport HTML, JUnit, screenshoty, trace i wideo przy błędach.
- GitHub Actions dla smoke, regresji UI, API i SQL.
---
![Zrzut ekranu aplikacji webowej](app.png)![Raport z egzekucji testów automatycznych wygenerowany w Playwright](report.png)
---
## Start

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
```

## Lokalna aplikacja demo

Repo zawiera prostą aplikację demo, żeby testy dało się uruchomić bez osobnego projektu.

W pierwszym terminalu:

```bash
npm run dev
```

Aplikacja będzie dostępna pod `http://127.0.0.1:3000`, a API pod `http://127.0.0.1:3000/api`.

W drugim terminalu:

```bash
npm test
```

## Najważniejsze komendy

```bash
npm run test:smoke
npm run test:ui
npm run test:api
npm run test:sql
npm run report
```

## Wymagane selektory aplikacji

Testy UI używają stabilnych atrybutów `data-testid`, np.:

- `email-input`, `password-input`, `login-submit`
- `service-select`, `provider-select`, `date-input`, `time-slot`, `booking-submit`
- `booking-confirmation`, `appointment-card`, `cancel-appointment`

Jeżeli aplikacja ma inne selektory, najlepiej zmienić je tylko w plikach `src/pages`.

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i ustaw:

- `BASE_URL` - adres aplikacji webowej.
- `API_URL` - adres API.
- `QA_PATIENT_EMAIL`, `QA_PATIENT_PASSWORD` - konto pacjenta.
- `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD` - konto administracyjne.
- `DB_*` - dane połączenia z PostgreSQL.
- `DB_PROVIDER` - ustaw `demo` dla lokalnej aplikacji demo albo `postgres` dla prawdziwej bazy.

## Struktura

```text
src/
  config/       konfiguracja środowiska
  fixtures/     rozszerzone fixture Playwright
  helpers/      klienci API, DB i dane testowe
  pages/        Page Object Model
tests/
  api/          scenariusze API
  sql/          walidacje bazy danych
  ui/           scenariusze end-to-end
```
