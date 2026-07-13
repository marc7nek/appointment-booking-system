# Strategia Testów QA

## Cel

Celem projektu jest szybkie wykrywanie regresji w krytycznej ścieżce aplikacji do rezerwowania wizyt: logowanie, dostępność terminów, utworzenie rezerwacji, anulowanie oraz zapis danych w bazie.

## Piramida testów

- API: szybkie testy kontraktów i reguł biznesowych dla rezerwacji.
- SQL: walidacje integralności danych po operacjach przez API.
- UI: najważniejsze ścieżki pacjenta w przeglądarkach desktop i mobile.

## Tagowanie

- `@smoke` - krótka bramka po deployu.
- `@regression` - szersze testy przed wydaniem.

## Środowiska

Projekt jest sterowany zmiennymi środowiskowymi:

- lokalnie przez `.env`,
- w CI przez GitHub Actions Secrets.
- lokalna aplikacja demo działa przez `npm run dev` na `http://127.0.0.1:3000`.

## Raportowanie

Każdy run generuje:

- raport HTML Playwright,
- JUnit XML dla systemów CI,
- trace, screenshot i video dla testów zakończonych błędem.

## Założenia techniczne

- Aplikacja udostępnia stabilne `data-testid` dla elementów UI.
- API posiada endpointy `/auth/login`, `/appointments`, `/appointments/:id`, `/appointments/:id/cancel`.
- Lokalnie `DB_PROVIDER=demo` używa endpointu diagnostycznego aplikacji demo do walidacji danych.
- Dla realnego środowiska `DB_PROVIDER=postgres` zakłada tabele `appointments` i `users`, gdzie `appointments.patient_id` wskazuje na `users.id`.

Jeżeli realna aplikacja ma inne endpointy albo schemat bazy, zmiany powinny być ograniczone głównie do `src/helpers` i `src/pages`.
