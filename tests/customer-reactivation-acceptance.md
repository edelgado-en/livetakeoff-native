# Customer reactivation — mobile acceptance

Verified locally on 2026-10-23. Changes are uncommitted; no deployment or store build was performed.

## Approved workflow

- Mobile uses the existing recovery-aware `POST /api/token/web/` endpoint. Despite its name, its contract is reusable by mobile. The legacy `/api/token/` endpoint is unchanged for older apps.
- Only the backend decides whether correct credentials belong to an eligible inactive customer and whether email delivery is possible.
- Mobile displays the backend's notice for sent mail, missing primary email, or unavailable delivery. It does not store tokens or fetch an authenticated profile in these cases.
- The email opens the existing HTTPS website. The customer sets a new password there, returns to the mobile app, and signs in normally.
- The password entered before the notice is cleared. No recovery information is placed in navigation parameters or persistent storage.

## Results

| Check | Result |
| --- | --- |
| Mobile service/provider regressions | 17 passed: `node --test tests/customer-reactivation.test.cjs` |
| Existing backend reactivation regressions | 25 passed: `venv/bin/python manage.py test api.test_customer_reactivation --noinput` in the API repository |
| Actual mobile LoginScreen/AuthProvider with live local Django API | Passed in a temporary React DOM/React Native Web acceptance harness using fictional accounts and a disposable PostgreSQL test database |
| Acceptance scenarios | Wrong credentials; missing email; inactive staff; delivery failure; sent notice; clearing the entered password; completing reactivation; rejecting the old password; new-password login; logout/login |
| Provider boundaries in acceptance harness | Email captured locally; secure storage, routing, native controls, and animation mocked. The delivery-failure UI case used a supplied backend response. Real login, recovery, and profile requests used the local API. |
| Android JavaScript bundle | Passed: `npm run check:android-bundle` |
| iOS JavaScript bundle | Passed: `npx expo export --platform ios --output-dir /private/tmp/lto-mobile-reactivation-ios` |
| TypeScript | Existing project backlog remains; output identical before and after this change |
| Diff whitespace check | Passed |
| Installed iOS/Android build, cold launch, session restoration, native keyboard and layout | Not tested: no running simulator or connected Android device available |
| Actual email inbox / email-to-browser interaction | Not repeated in this task; no real emails sent |

## Before mobile release

The backend and website reactivation feature must be deployed first, including its existing database migration. No additional backend code, migration, environment variable, dependency, or app-version change is introduced by this mobile patch.

Verify the installed app on iOS and Android: cold launch, existing session restoration, correct/incorrect credentials, notice layouts, browser password creation from the email, return to the app with a new password, and sign-out/sign-in. Passing mocked native boundaries or JavaScript bundling does not establish that device acceptance has passed.
