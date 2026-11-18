# EdenNetwork | Initial GitHub and Vercel release gates

**Status: NOT READY FOR PRODUCTION SOURCE IMPORT OR GIT-TRIGGERED DEPLOYMENT.**

## Before importing the deployed website source
- [ ] Record existing Vercel project ID `prj_f8HD4bSUreR5TFp7JwB3bb2Q7n3a`, deployment ID, production aliases, and current routes.
- [ ] Confirm provenance of the existing Vercel deployment and retain a private backup outside the public repository.
- [ ] Review source files and assets for secrets, member records, unpublished documents, licensed third-party assets, and security-sensitive internal procedures.
- [ ] Configure protected `main`, PR reviews, mandatory tests and secret scanning where available.
- [ ] Import vetted source to a separate branch and open a new PR; do not overwrite or recreate the Vercel project.

## Before any preview or production integration
- [ ] Confirm the Git connection and precise production branch, preview branch and deployment settings.
- [ ] Verify only the **names and scopes** of Vercel Firebase web-config variables; never publish values or service-account credentials.
- [ ] Test Firebase rules/server permission checks in an emulator or authorized isolated environment.
- [ ] Test existing-account sign-in, public-only RealID lookup, recovery failures, guest routes, mobile layout, denied requests and rate-limits.
- [ ] Keep synthetic ZK research and personhood feature gates disabled; no biometrics or real unique-human claims.
- [ ] Capture pinned commit SHA, CI results, reviewed preview URL, rollback deployment and explicit owner approval.
- [ ] Confirm production domain and promotion method before deploying the approved commit.

## Separate release lanes
Light of Hope V16, EdenNetwork production, PwnZ, Hope Labs identity research, Open Knowledge directory, actual archive hosting, Pi payment integrations, and token/DAO activation have separate release gates. A preview build does not activate any of them.

This checklist documents a safe handoff; it does not authorize or trigger a deployment.
