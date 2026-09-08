# LiveTakeoff React Native guidance

## Scope discipline

- Make only the requested mobile change. Do not combine it with unrelated formatting, package upgrades, version bumps, icon changes, or release configuration edits.
- Preserve existing user changes in the working tree and inspect both platform-specific behavior and shared Expo code before editing.
- Keep iOS and Android behavior aligned unless the fix is intentionally platform-specific. Explain any platform branch that is added.

## Application rules

- Preserve existing role, status, job-editing, tail-alert, service-recommendation, assignment, upload, and notification behavior when redesigning a screen.
- Internal coordinator takes priority when a user is also a project manager unless a narrower existing rule explicitly applies.
- Operational datetimes are wall-clock values. Capture and send the formatted local-time string exactly as selected; do not round-trip it through timezone conversion. Calendar time controls use military time where required by the existing workflow.
- Keep tail numbers uppercase at input and payload boundaries where the web and API expect them.
- Treat production-only behavior as a native-build concern. Expo Go success is useful but does not validate native configuration, adaptive icons, signing, release JavaScript settings, or store delivery.

## Verification

- Run `npm run typecheck` for TypeScript changes, but distinguish newly introduced errors from the documented existing typing backlog.
- For Android release-sensitive JavaScript changes, run `npm run check:android-bundle`. For native configuration or dependency changes, use an appropriate EAS preview build and test it on a physical Android device.
- Verify cold launch, login/session restore, the changed workflow, uploads if affected, and sign-out/sign-in on relevant production-like builds.
- For shared UI changes, verify both iOS and Android. Pay special attention to controlled text inputs, keyboard behavior, modal stacking, safe areas, and image/icon scaling.

## Versions, builds, and submissions

- Do not change `expo.version`, the iOS build number, or Android version code unless the user requests a release or version bump.
- The project uses EAS remote app versions with auto-increment. Check the current remote store build version before building; do not reuse a previously uploaded iOS build number or Android version code.
- Do not run EAS production builds or submit to Apple or Google without an explicit request. Building does not automatically authorize store submission, and submission does not authorize releasing to users.
- Before release, prefer the documented sequence in `README.md`: validate, test an Android preview APK or iOS TestFlight build, then create and submit the production artifact.
