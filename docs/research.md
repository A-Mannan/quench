# Research: claims register

Phase 0 seeded this register from the user's FACTS (2026-11-08). **No web fetch, RPC call or on-chain verification was performed in Phase 0.** Every row is therefore `seeded by user, unverified` until group 1 attaches live evidence.

## Register

| ID | Claim | Source | Date | Status |
|----|-------|--------|------|--------|
| C1 | Injective EVM mainnet chain ID is 1776. | User brief FACTS (2026-11-08); docs.injective.network | 2026-11-08 | seeded by user, unverified |
| C2 | Injective EVM testnet chain ID is 1439. | User brief FACTS (2026-11-08); docs.injective.network | 2026-11-08 | seeded by user, unverified |
| C3 | Testnet RPC endpoint is `https://k8s.testnet.json-rpc.injective.network/`. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C4 | Precompiles are Bank `0x64`, Exchange `0x65`, Staking `0x66`, Swap `0x68`. | User brief FACTS (2026-11-08); docs.injective.network/developers-evm/precompiles | 2026-11-08 | seeded by user, unverified |
| C5 | The staking precompile row has no reference page; its ABI must come from InjectiveLabs/solidity-contracts `demos/staking` and each call must be proven on testnet. `[UNVERIFIED]` until then. | User brief FACTS (2026-11-08); docs.injective.network/developers-evm/precompiles; github.com/InjectiveLabs/solidity-contracts | 2026-11-08 | seeded by user, unverified |
| C6 | Generic Foundry cannot see Injective precompiles; calls revert with "non-contract address". | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C7 | InjectiveLabs' patched Foundry is required for fork/testnet work, or precompiles must be mocked in unit and fuzz tests, with the choice stated. | User brief FACTS (2026-11-08); github.com/InjectiveLabs/foundry/releases | 2026-11-08 | seeded by user, unverified |
| C8 | INJ unbonding takes 21 days. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C9 | Hydro hINJ is 1:1 pegged; the location where yield accrues must be checked. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C10 | Hydro yINJ is yield-bearing; its EVM ERC-20 existence is `[UNVERIFIED]`. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C11 | Accumulated stINJ/wstINJ exist on Injective EVM; Hats Finance, MetaTrust and Nethermind audits are listed generally, but coverage of the Injective EVM contracts is `[UNVERIFIED]`. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C12 | Alchemix V3 is BUSL 1.1; production use needs the Alchemix Association's licence; a friendly-fork route is documented at alchemix-v3-docs.vercel.app/projects/how-to/friendly-fork. | User brief FACTS (2026-11-08); alchemix-v3-docs.vercel.app/projects/how-to/friendly-fork | 2026-11-08 | seeded by user, unverified |
| C13 | Each Alchemix repo's LICENSE must be read before its code; no Alchemix code, including snippets quoted in audit reports, may be copied. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |
| C14 | Alchemix licensing is an unresolved legal risk for this project. | User brief FACTS (2026-11-08) | 2026-11-08 | seeded by user, unverified |

## Demo UI research (2026-11-09)

These rows support `build-quench-demo-ui`. Each was fetched or observed on 2026-11-09; no copied copy, layout or visual asset is used.

| ID | Claim | Source | Date | Status |
|----|-------|--------|------|--------|
| U1 | Awwwards scores Design 40%, Usability 30%, Creativity 20%, Content 10%, with a separate Developer Award process. | https://www.awwwards.com/about-evaluation/ | 2026-11-09 | verified |
| U2 | Recent Sites of the Day observed: Extrafazant (Nov 8), Justin Jefferson (Nov 7), ViV (Nov 6), Agrumea Farm (Nov 5), Grail (Nov 4), DeepBook (Nov 3). Each listing shows a SOTD and multiple interaction/scroll elements. | https://www.awwwards.com/websites/sites_of_the_day/ | 2026-11-09 | verified |
| U3 | Extrafazant's first screen is a centred, oversized condensed display line over a fine serif, with a saturated blue accent and a single logo band; navigation is a small floating bar. | https://www.extrafazant.nl/ | 2026-11-09 | verified |
| U4 | DeepBook's first screen is a full-bleed photographic hero with a large sans headline and a compact dark nav; the page is low-density and image-led, with the app CTA isolated in the nav. | https://www.deepbook.tech/ | 2026-11-09 | verified |
| U5 | ViV uses a giant wordmark as the hero, a mixed-height photographic masonry band, and almost no chrome; the layout is editorial-collage rather than card-based. | https://vivmgmt.com/ | 2026-11-09 | verified |
| U6 | Agrumea Farm uses a warm field, a centred illustrated mark, a floating pill menu and a cookie sheet; the composition is sparse and place-led, not a product dashboard. | https://www.agrumeafarm.it/en | 2026-11-09 | verified |
| U7 | Grail and Spyker Cars both gate the first paint behind a branded preloader; the observed first screens are logo-only, so their content hierarchy is `[UNVERIFIED]` beyond the preloader. | https://grail-app.com/ ; https://www.spykercars.com/ | 2026-11-09 | verified (preloader only; rest [UNVERIFIED]) |
| U8 | Aave's first screen is a centred, airy hero with a violet gradient field, a single rounded CTA pair and a large amount of negative space. | https://aave.com/ | 2026-11-09 | verified |
| U9 | Hyperliquid's first screen is an editorial split: a large serif headline on the left, a short sans description and mint CTA on the right, then a dark data band with a dotted field. | https://hyperliquid.xyz/ | 2026-11-09 | verified |
| U10 | DeepBook, Aave and Hyperliquid all use one dominant hero composition and defer product density to later bands; none uses a uniform card grid as the first screen. | the three URLs above | 2026-11-09 | verified (observed screenshots) |
| U11 | Alchemix V3 docs describe self-repaying loans as scheduled redemptions paying down debt while vault yield refills collateral; yield does not reduce debt directly. | https://docs.alchemix.fi/user/concepts/self-repaying-loans | 2026-11-09 | verified |
| U12 | Alchemix V3's Transmuter pays a 1:1 rate after a known waiting period, paid as MYT, with early exit at the vested share. | https://docs.alchemix.fi/user/concepts/transmuter | 2026-11-09 | verified |
| U13 | Alchemix V3 is BUSL 1.1; production use requires a licence, and the Friendly Fork route requires a licence fee/revenue share, no Alchemix trademarks, attribution and an audit of modifications. | https://docs.alchemix.fi/projects/how-to/friendly-fork | 2026-11-09 | verified |
| U14 | Current INJ staking APR shown by Staking Rewards is 7.53% APY. | https://stakingrewards.com/asset/injective-protocol | 2026-11-09 | verified (displayed headline; live rate can change) |
| U15 | Injective EVM testnet chain ID is 1439; mainnet is 1776; testnet RPC is `https://k8s.testnet.json-rpc.injective.network/`. | https://docs.injective.network/developers-evm/network-information | 2026-11-09 | verified |
| U16 | Injective precompile addresses are Bank 0x64, Exchange 0x65, Staking 0x66, Swap 0x68; the docs still have no staking reference page. | https://docs.injective.network/developers-evm/precompiles | 2026-11-09 | verified |
| U17 | OpenDesign's craft layer (Apache-2.0) supplies anti-AI-slop, typography, colour, state-coverage, animation-discipline and accessibility rules; its Stripe package is a brand-specific aesthetic and is not used as Quench's identity. | https://github.com/nexu-io/open-design | 2026-11-09 | verified |
| U18 | Taste Skill 2.5.1 is MIT-licensed and requires Node 22+ and Chrome; its skill name is `design-taste-frontend`. | https://github.com/leonxlnx/taste-skill | 2026-11-09 | verified |

**Important divergence:** the BRIEF says Wellspring applies LST yield to debt automatically and harvest derives only from exchange-rate deltas. Alchemix V3 docs (U11) say yield does not reduce debt directly. Quench's UI follows the BRIEF; Alchemix is used only for mental-model comparison. The demo labels this model as simulated.

## Update rules

- **Verified:** attach a live URL or explorer/RPC output, the observation date, and set status to `verified`.
- **Refuted:** attach the contradicting evidence, the date, and set status to `refuted`; then update the affected design decision.
- **Still unknown:** keep `[UNVERIFIED]` in the claim and state exactly what would resolve it.
- Every row must have a source, date and status. No row may be deleted; superseded rows are marked.
- Do not paste Alchemix code or audit-report snippets into this file.
- Group 1 tasks 1.2–1.12 are the evidence-gathering work; group 2 task 2.7 closes the register.
