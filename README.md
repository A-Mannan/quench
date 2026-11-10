# Quench

**A self-repaying loan protocol for Injective EVM.**

Deposit a yield-bearing INJ liquid-staking token as collateral, borrow `qINJ` (an INJ-denominated
synthetic) against it, and let the staking yield pay the debt down on its own. When the debt hits
zero, the collateral is yours to withdraw.

> **Status: testnet only. Contracts are not deployed. Every number in this repository is a
> simulation, not a promise.** See [Status](#status--read-this-first) before anything else.

---

## The problem

Self-repaying loans are a real idea, but the versions that shipped have a liquidity problem at
the exit.

You deposit a staked token. You borrow a synthetic. The yield from your collateral is supposed to
pay the loan down while you do nothing. That part works. The problem is the **exit**: to get your
collateral back you need the underlying asset, and on Injective that asset unbonds over **21
days**. So the loan repays itself in weeks and then the collateral takes another three weeks to
come back — a month of your capital locked up for a position that was supposed to be hands-off.

Quench removes that wait.

**Redemption pays in the collateral token itself**, not in INJ. No unbonding, no queue behind
someone else's withdrawal. If you would rather not wait at all, `qINJ` is a normal ERC-20 — you can
sell it on a DEX and be done.

---

## How it works

```
   deposit stINJ            borrow qINJ              yield repays            debt = 0
  ───────────────▶  ─────────────────▶  ───────────────────────▶  ─────────────────▶
   (collateral)        (up to 50% LTV)      (staking yield,          (withdraw your
                                             automatic)              collateral)
```

1. **Deposit** the staked-INJ liquid staking token as collateral (`stINJ` in the demo; `wstINJ` in
   the planned on-chain build, where `stINJ` is its underlying). Its value is read from the LST
   contract's own exchange rate, never from DEX spot.
2. **Borrow** `qINJ` up to **50.00% LTV**. A 0.50% borrow fee is taken in `stINJ` collateral.
3. **The yield pays the debt.** As the LST exchange rate rises, the protocol converts the gain into
   `qINJ` and burns it against your debt. Debt falls; collateral keeps earning. You do nothing.
4. **At zero debt, withdraw** the remaining collateral. No unbonding, no queue.

**Two exits, and you pick.**

| Route | How long | What you get |
|---|---|---|
| Redeem from the protocol | about **7 days** | `stINJ`, straight from the swap buffer |
| Sell `qINJ` on a DEX | market speed | INJ or `stINJ`, at market price |

Redemption pays in `stINJ`, never in INJ, and never waits on the 21-day unbonding.

### The numbers, with their sources

Every figure below is traceable. Full register: [`docs/promo/CLAIMS.md`](docs/promo/CLAIMS.md).

| Claim | Value | Source | Date |
|---|---|---|---|
| INJ staking APR (scenario input) | 7.53% | [Staking Rewards — Injective](https://stakingrewards.com/asset/injective-protocol) | 2026-11-09 |
| Maximum LTV | 50.00% | `[DECISION]` illustrative, set by simulation | 2026-11-09 |
| Borrow fee | 0.50% | `[DECISION]` illustrative | 2026-11-09 |
| Swap fee | 0.50% | `[DECISION]` illustrative | 2026-11-09 |
| Redemption time | about 7 days | `[DECISION]` illustrative | 2026-11-09 |
| Swap buffer | 500 `stINJ` | `[DECISION]` illustrative | 2026-11-09 |
| INJ unbonding period | 21 days | [Staking Rewards](https://stakingrewards.com/asset/injective-protocol), [Injective docs](https://docs.injective.network/defi/tokens/inj-coin) | 2026-11-10 |
| Injective EVM testnet chain ID | 1439 | [Injective docs](https://docs.injective.network/developers-evm/network-information) + live RPC `eth_chainId` → `0x59f` | 2026-11-10 |

### A worked example

From the simulator, at the scenario APR above:

| Moment | Collateral | Debt | LTV |
|---|---|---|---|
| After borrowing | 199.55 `stINJ` | 90.00 `qINJ` | 45.10% |
| After 1 year | 199.55 `stINJ` | 74.44 `qINJ` | 34.60% |
| After ~6 years | 199.55 `stINJ` | **0.00 `qINJ`** | 0.00% |

No payment from you at any point in that table. The collateral kept earning the whole time.

---

## Status — read this first

This is an **honest snapshot**, not a pitch deck. Everything below is either verified, or tagged.

| | |
|---|---|
| **Network** | Injective EVM **testnet (chain 1439)**. Never mainnet. No mainnet transaction has ever been sent from this repository. |
| **Contracts** | **Not deployed.** A clean-room Solidity implementation exists and passes its test suite locally; the current plan is to build the on-chain version on a pinned fork of Alchemix V3, whose licence explicitly permits non-production use. |
| **Audit** | **No audit has been performed on Quench.** No third party has reviewed this code. Do not describe it as audited. |
| **The demo UI** | A **simulator**. The wallet, the RPC and the contracts are simulated. It is a real, deterministic engine with a client seam where the chain client will plug in — not a mock of one. |
| **The numbers** | The APR is a **scenario assumption** captured on 2026-11-09, not a quote. The LTV, fees, redemption term and buffer are `[DECISION]` illustrative values chosen by simulation, not protocol parameters. |
| **On-chain E2E** | **Blocked.** It needs a funded testnet key. This repository never requests, stores or uses real keys or funds. The equivalent lifecycle is proven locally. |
| **Licensing** | The planned on-chain build is derived from Alchemix V3 (BUSL 1.1). Testnet use is inside the licence grant; **production use requires a separate "Friendly Fork" agreement** with the Alchemix Association, including a licence fee, a revenue share, an independent audit of our modifications, and removal of Alchemix trademarks. Unresolved legal risk, tracked in [`docs/research.md`](docs/research.md) (C12, C14). |

### What is verified, and how

We do not make unfalsifiable claims. Every factual claim in this repository is registered with a
source and a date in [`docs/research.md`](docs/research.md) — chain IDs, precompile addresses, token
addresses, the exchange rate, the APR, the unbonding period, the licence terms. Claims we could
**not** verify are marked `[UNVERIFIED]` and say what would resolve them. Four rows in the register
currently carry that status, and each one is written down rather than quietly assumed away.

---

## What is in this repository

```
web/        The demo application — landing + full app (Loans, Positions, Withdraw, Swap)
promo/      The 40-second promo film: composition, score, voiceover, QA harness
src/        Clean-room Solidity implementation (frozen reference build)
test/       Foundry test suite
script/     Deploy script and the LTV/APR simulator
openspec/   Change proposals, designs, specs and task lists
docs/       Brief, research register, design system, QA gates, demo script
```

### The demo application

A full working product surface — not a landing page with a mockup attached.

- **One atomic transaction** to both add collateral and borrow.
- **Live after-values** on every form: collateral, debt, LTV and headroom *after* the transaction.
- **Partial withdrawal** while debt remains, as long as LTV stays healthy.
- **Manual repayment**, and **self-liquidation** when you want out.
- **Day and night** themes, keyboard navigable, and an automated axe scan at WCAG 2 A/AA level reports zero violations.
- Every screen carries a `Simulated` badge. There are no fake controls, no decorative numbers and
  no dead buttons.

```bash
cd web
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # engine tests
pnpm e2e          # full browser flows, three viewports, accessibility checks
```

### The promo film

A 40-second, 1920×1080 film built from real captures of the app. Original score and sound design,
an ElevenLabs voiceover, and a measured QA harness (`promo/tools/qa.py`) that checks the spec, the
cuts, the loudness, the text size and the contrast.

```bash
bash promo/render.sh    # capture -> score -> voiceover mix -> render -> mux -> captions -> QA
```

---

## How we work

This project is built on one rule: **every claim is traceable, and every unknown is written down.**

- Each design decision cites a source or is tagged `[DECISION]`.
- Each task in a task list names the evidence that closed it.
- No "safe", "secure", "audited" or "live" without a citation behind it.
- Risks are modelled in [`docs/RISKS.md`](docs/RISKS.md), including the ones that are embarrassing.
- When live documentation contradicts an assumption, we stop and change the design rather than
  defend the assumption.

Read [`docs/STATUS.md`](docs/STATUS.md) for the current state, the last action and the next step.

---

## Documentation

| Document | What it is |
|---|---|
| [`docs/STATUS.md`](docs/STATUS.md) | Current phase, last action, next step, blockers, open questions |
| [`docs/BRIEF.md`](docs/BRIEF.md) | The verbatim project brief — the requirements we are held to |
| [`docs/research.md`](docs/research.md) | The claims register: every fact, its source, its date, its status |
| [`docs/RISKS.md`](docs/RISKS.md) | Threat model and the clean-room statement |
| [`docs/DESIGN.md`](docs/DESIGN.md) | The design system, and the reasoning behind each decision |
| [`docs/QA.md`](docs/QA.md) | Measured quality gates for the app, pasted as they were run |
| [`docs/DEMO-SCRIPT.md`](docs/DEMO-SCRIPT.md) | A 90-second walkthrough script |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Deploy runbook for the reference build (testnet only) |
| [`docs/CASE-STUDY.md`](docs/CASE-STUDY.md) | Five design decisions and the alternatives we rejected |
| [`docs/promo/`](docs/promo/) | The film's brief, claims register, asset ledger and QA report |

---

## The ask

We are looking for **technical and ecosystem partners on Injective EVM** — liquidity providers for
the redemption buffer, integrators who want an INJ-denominated synthetic that repays itself, and
reviewers who will tell us where we are wrong.

The three things that would move this project furthest:

1. **A funded testnet key.** On-chain end-to-end proof is the one gate we cannot pass alone. It
   must never be committed, and this repository will not ask you to hand one over.
2. **Reviewers who will attack the design**, not just the code.
3. **A decision on the licence.** Production use of the Alchemix V3 base requires a Friendly Fork
   agreement. That is a business decision, and we would rather make it in the open than quietly
   ship a fork we have no right to ship.

---

## Licence and attribution

This repository's own code and documentation are ours. Any third-party component retains its own
licence — see [`docs/DEPENDENCIES.md`](docs/DEPENDENCIES.md) for the web stack and
[`docs/promo/ASSETS.md`](docs/promo/ASSETS.md) for the film's fonts, score and voiceover.

The planned on-chain build derives from **Alchemix V3**, which is BUSL 1.1 (MIT for its MYT
components). BUSL 1.1 permits non-production use, which is what this project currently is. It does
**not** grant trademark rights, and it requires the Friendly Fork agreement before production.
Attribution and no-trademark obligations apply from the first commit of any derived code.
