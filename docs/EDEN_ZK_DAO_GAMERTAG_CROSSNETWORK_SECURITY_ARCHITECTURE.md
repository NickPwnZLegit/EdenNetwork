# Eden RealID / Hope of Humanity | Shared ZK, DAO and name governance architecture
**Hope Labs research handoff · November 18, 2026 · NOT a production ZK implementation**

## One shared account owner, three user experiences
- **EdenNetwork:** Create or recover an Eden RealID; future project membership and governance.
- **Light of Hope:** Create or sign in with the same Eden RealID; community posts, verified profile, Messenger, optional LightVault, Give Hope and Show Empathy.
- **PwnZ.live:** Use the same Eden credential; reserve a **separately unique PwnZ Gamertag**, with gamer/creator/developer roles and future opt-in collectibles. Do not overwrite or delete existing legacy gamer accounts.
- **Firebase now:** the three preview sites' configured project IDs match as of November 18, 2026. This does not prove all authorized domains, Auth sessions, Firestore rules and account recovery are correct. Each domain stores its own web session; real SSO is a separate audited project.

## What the future privacy-preserving ZK layer must and must not do
1. Preserve existing email/password login, with optional safer recovery or passkeys later. **Do not force a third-party KYC provider, legal name, real-world ID, face scan, thumbprint, wallet, or biometric submission** as the entry path to Light of Hope.
2. Design an independently reviewed private **human uniqueness issuance process**. A ZK proof can conceal eligible membership evidence, but cannot establish one-person-one-credential by itself. A timestamp or wallet cannot rule out repeated registration. The duplicate-detection mechanism, privacy, consent, appeal and exclusion risks remain research blockers.
3. Keep identity **account-owner mappings, sensitive enrollment inputs and secret keys off all public ledgers**. A public ledger may hold only appropriately batched and de-linkable aggregate commitments or verification metadata, after privacy review. Even timestamps can correlate account creation through timing.
4. A verified ZK proof must bind to a narrowly scoped domain/action and current epoch, and produce a proposal/action-specific one-use nullifier that cannot be correlated across unrelated sites or votes. Independently verify proof, chain parameters, proof age, revocation root and replay protection in trusted server or smart contracts.
5. ANNEAL may assist performance diagnostics and anomaly research; it is **not** a ZK verifier, personhood issuer, identity judge, moderator, financial oracle, voting authority or release gate.
6. Make recovery and migration non-destructive: an account's existing Eden RealID and primary authentication should survive loss of a phone, wallet or future optional NFT. A Gamertag NFT must never be the only account recovery method.

## Governance interface for DAO
Eligible human: at most **one base ballot** per proposal + **one bonus ballot** if independently verified snapshot of EDEN holding. Weight is max 2, not proportional to staking or wealthy wallets.
- A nullifier is scoped **per proposal and role** to prevent duplicates but must not permit cross-proposal identity correlation.
- A member may propose or join ecosystem projects based on audited participation permissions, and voting rights are not conditioned on exposing legal identity.
- A holder vote requires a separately audited, historical token snapshot; current wallet balance alone is insufficient. Wallet ownership and token holding are different from uniqueness.
- Proposal actions, quorum, snapshot timing, chain disputes, delegation, moderation, emergency controls and revocation need reviewed governance rules.
- Treasury payments, sanctions, user access, consensus, token supply, and NFT name reassignment are **not** controlled by ANNEAL.

## Future NFT name museum
- Eden RealID handle and PwnZ Gamertag are **two registries** with separate immutable ownership and reserved-name rules.
- The museum groups future Eden Name Heritage, PwnZ Gamer Names, Supporter Milestones, Creator Collections and Game Achievements. Mere inclusion in UI never mints an NFT.
- On-chain token metadata must refer only to opt-in *public display names or revocable public aliases*, never UID, legal names, biometrics, credential commitments or recovery secrets.
- Transfer/sale capability stays disabled until atomic registry+contract ownership resolution, reserve registry, user consent, marketplace compliance, account recovery, content standards, resale rights, and independent audits.
- Every member retains at least one secure nontransferable account recovery path.

## Cross-repository integration contract
All three web apps eventually call a **common audited versioned verifier**; no site decides identity validity by looking for public names:
- `verifyEligibility(opaqueProof, scope, action, epoch, currentRoot)` -> permit/deny with signed or verified result, never subject identity.
- `consumeScopedNullifier(proposalOrAction, nullifier)` -> exactly once, transactionally or on-chain; replay rejected after restart and after rollback.
- `resolveAccountOwner(session)` -> private Firebase user record only; account email and owner UID must never appear in ZK public proof, logs or on-chain.
- `verifyHolderSnapshot(walletProof, token, block)` -> optional second vote only after independent holder snapshot auditing.
- `recoverRegisteredName(session, currentProof)` -> secure non-destructive ownership recovery; no NFT possession as identity substitute.

These are **proposed interfaces**, not deployed endpoints. No fake "personhood verified" UX and no fabricated ZK acceptance status.

## Required negative tests
- Same human attempts second enrollment, including through all three domains and with different email addresses.
- Compromised verifier key, forged membership, proof from old epoch, replay and cross-site scope confusion.
- Public timestamp linkage attack, repeated nullifier correlation across proposals, issuer recovery/insider deanonymization.
- Wallet-based Sybil voting, false EDEN holder snapshot, missing profile agreement, reorg and duplicate ballot in two sessions.
- Lost phone, legacy account migration, name collision, disabled Auth account, revoked enrollment, malicious media/report abuse.
- Controlled rollback of database *and* checkpoint while independent witness remains monotonic.
- ANNEAL produces incorrect/hostile signal; system must reject its attempt to authorize identity, access, votes, funds or removal.

## Strict release gates
1. Independent personhood and uniqueness method fully specified, consent/privacy assessed. No real biometric or identifying material in Hope Labs fixtures.
2. Audited ZK circuit, verification keys, nullifier scoping and recovery; synthetic and adversarial benchmarks published with reproducible methods.
3. Reviewed server-side authorization, source-code and contract provenance; signed build and replay/rollback witness evidence.
4. Combined Firestore emulator tests and authenticated mobile/browser tests across all sites.
5. DAO policy, holder snapshot, contract rights, legal review and stakeholder approval.
6. Public documentation explicitly explains limits and who can revoke or recover credentials.
7. Each production enablement requires a separate approved commit, configuration and rollback procedure.

**For now:** The live user-facing product remains email-first with public names and preview-only architectural demonstrations. Current ZK and synthetic DAO labs may illustrate ideas, not make decisions.
