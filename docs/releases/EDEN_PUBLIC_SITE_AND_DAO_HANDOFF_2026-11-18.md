# EdenNetwork | GitHub-to-Vercel candidate and shared network contracts
**Status: DRAFT / PREVIEW ONLY.** This is a public-safe site and architecture release, **not** a live Eden RealID server, DAO or wallet.

## Existing deployment
- A READY `edennetwork-live` Vercel project already hosts `edennetwork.live`.
- That Vercel deployment is **not reconciled to the current public GitHub repository**. Its file provenance has not been fully audited. Do not overwrite or reattach production until its current source is backed up and compared.
- This `index.html` is a new public-safe **candidate**, not a reconstruction of the existing site's exact deployed source.

## Authentication / recovery
- Keep existing Firebase email/password authentication for all eligible transitional members.
- Public Eden RealID handle and private human-uniqueness credential are distinct; never expose account-to-person mappings in a public ledger or ANNEAL test fixture.
- PwnZ-only membership can begin under its own community rules without forced Eden issuance; later Eden linking requires the *existing* ecosystem account and approved uniqueness collision checks.
- A valid public ZK timestamp alone cannot prove one unique human. Enrollments, recovery, revocation, duplicates and appeals remain unimplemented research gates.
- Never move private account, wallet recovery, device identifiers or biometric inputs into the public Git repository.

## Proposed DAO / projects
- One base vote per independently verified unique human per proposal. Optional one additional vote for verified EDEN holder, max two total.
- Requirements: audited membership proofs, proposal permissions, snapshots, consent, dispute handling, anti-Sybil protections, on-chain/off-chain reconciliation and human governance.
- ANNEAL signals are advisory only and cannot assign identities, eligibility, funds, voting power or account access.
- Project membership, proposal submission, role delegation and moderation require independent authorization rules. No simulated button should imply a live vote.

## Cross-site services
- Messenger of Light is intended to reuse reviewed shared Firebase conversation permissions; clients on different domains do not inherit session state automatically.
- LightVault remains an optional wallet interface on Light of Hope. Never display wallet address as a cross-site identity key.
- Light of Hope and PwnZ media uploads require private staging, human moderation, retention, quotas, and distinct access paths for private messages.
- Pi marketplace and Lightchain chain integration remain independent of core account sign-in, subject to testnet, legal, treasury and app approvals.

## Release gates
[ ] Backup existing EdenNetwork Vercel production deployment and establish source provenance.
[ ] Validate this public candidate's links and responsive layout; Vercel preview only.
[ ] Confirm Vercel project Git connection / production branch before allowing automatic deploys.
[ ] Reconcile Firebase project, authorized domains, rules and current member account recovery with Light of Hope.
[ ] Cross-site profile/name creation and existing-account login tested on two independent devices.
[ ] Real ZK human uniqueness not claimed/activated until audited implementation and privacy review.
[ ] DAO and holder bonus votes not activated until audited controls, legal/token review, and end-to-end tests.
[ ] Explicit release approval of the exact commit SHA and rollback deployment.
