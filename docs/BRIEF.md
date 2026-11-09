GOAL
Build Quench, an Alchemix-style self-repaying loan protocol on Injective EVM, clean-room. Users deposit a yield-bearing INJ liquid-staking token (LST) into a Basin and mint qINJ (INJ-denominated synthetic) up to collateralValue × maxLTV. Wellspring applies LST yield to debt automatically, Confluence redeems qINJ for collateral value, and at zero debt the user withdraws the remaining collateral. Deliver a self-reviewed, testnet-only MVP: one Basin, one LST, one synthetic.
Fixed names: Quench, qINJ, Basin (vault), Wellspring (harvest and repayment), Confluence (redemption), QNCH (governance token, interface stub only). Out of scope: frontend, mainnet, real keys or funds, leverage loops, multi-collateral.

FACTS (verified 2026-11-08; re-confirm at build time; live docs win)
- EVM chain IDs: mainnet 1776, testnet 1439. Testnet RPC: https://k8s.testnet.json-rpc.injective.network/
- Precompiles (docs.injective.network/developers-evm/precompiles): Bank 0x64, Exchange 0x65, Staking 0x66, Swap 0x68. The staking row has no reference page: take its ABI from InjectiveLabs/solidity-contracts demos/staking and prove each call on testnet; [UNVERIFIED] until then.
- Generic Foundry cannot see precompiles (calls revert "non-contract address"). Use InjectiveLabs' patched Foundry (github.com/InjectiveLabs/foundry/releases) for fork/testnet work, or mock precompiles in unit and fuzz tests, and state which.
- INJ unbonding takes 21 days.
- LST candidates. Hydro: hINJ is 1:1 pegged, so check where yield accrues; yINJ is yield-bearing, EVM ERC-20 existence [UNVERIFIED]. Accumulated: stINJ/wstINJ on Injective EVM; audits by Hats Finance, MetaTrust and Nethermind are listed generally, and whether any covers the Injective EVM contracts is [UNVERIFIED].
- Alchemix V3 is BUSL 1.1: production use needs the Alchemix Association's licence (friendly-fork route: alchemix-v3-docs.vercel.app/projects/how-to/friendly-fork). Read each repo's LICENSE before reading its code and report what you find. Copy no Alchemix code, including snippets quoted in audit reports. Flag licensing to the user as unresolved legal risk.

DECISIONS (change only with cited evidence; log in design.md)
- Solidity + Foundry on Injective EVM, not CosmWasm.
- Collateral is an existing LST. Choose native delegation via 0x66 only with cited evidence the LST path fails, because it makes Quench a staking manager.
- Collateral and debt are INJ-denominated. Solvency uses the LST→INJ exchange rate read from the LST contract, never DEX spot. Harvest derives only from exchange-rate deltas, never side-channel reward claims.
- Redemption must not wait on unbonding. Pay out in LST units (Alchemix V3's Transmuter pays yield tokens, not underlying) or justify another verified liquid route; state worst-case delay wherever redemption is mentioned.
- Define and test the path for LST slashing or rate drops (liquidation or loss socialisation).
- Rate source fixed per Basin at deploy. A stale or out-of-bounds rate delta pauses harvest and mints. If the LST is upgraded or deprecated, pause mints and keep exits open. Pausing never blocks honest exits.
- Timelocked admin; no admin path to mint unbacked qINJ; no unbounded loops over users; reentrancy guards on all value paths.
- Set maxLTV, fees and redemption term by simulation (repayment time vs staking APR, sourced and dated), not by copying Alchemix.

RESEARCH (group 1 → docs/research.md)
1. Injective docs from docs.injective.network/llms.txt: precompile and EVM pages, staking demo, WINJ, testnet faucet.
2. LST decision matrix: audits, admin/upgrade powers, exchange-rate function, redeem path, DEX liquidity, contract-measurable yield. Chosen LST: verified source on the explorer and current testnet addresses.
3. Alchemix docs and V3 reports (reports.immunefi.com/alchemix-v3; cdn.cantina.xyz/reports/cantina_competition_alchemix_may2025.pdf): extract bug classes as your test checklist.
4. Current INJ staking APR, with date.

TOOLS AND SKILLS
List installed skills/MCP/tools first. Use if present: Injective docs MCP and llms.txt; InjectiveLabs injective-evm-developer skill; Trail of Bits building-secure-contracts, entry-point-analyzer, property-based-testing, spec-to-code-compliance; Foundry; Slither; web search/fetch. Install or run nothing external that isn't present or user-approved; name what's missing and proceed without it.

FAILURE MODES → GUARDS
1. Invented or stale Injective facts (0x66 ABI, LST interfaces, addresses, APR) → source each from fetched docs, verified source or an on-chain call; otherwise [UNVERIFIED] and out of code until proven on testnet.
2. Naive Alchemix port (assumes instant underlying liquidity, mismeasures yield, copies licensed code) → the DECISIONS above plus the clean-room rule.
3. Green-test theatre → one invariant per researched bug class: per-account earmark and debt sums equal global; redemptions cannot freeze; fees bounded; rounding never favours the user; LST donation/inflation; reentrancy. A failing invariant blocks delivery.

SUCCESS CRITERIA
- forge build and forge test pass, run counts shown, including the invariants above.
- Protocol-initiated transitions (mint, withdraw, harvest, redeem) keep per-account collateralValue × maxLTV ≥ debt under fuzz; rate drops follow the defined, tested slashing path.
- Slither: no unresolved high/medium findings.
- Simulation of debt-repayment time across ≥3 LTV/APR scenarios.
- End-to-end on testnet 1439: deposit → mint → yield accrues → harvest reduces debt → redeem → withdraw, with explorer-verified addresses, or the exact blocker.
- Every design choice cites a source or is tagged [DECISION]; every task ticked has evidence.

DELIVERABLES
OpenSpec change `build-quench-mvp` (delta specs, design.md, tasks.md kept current), docs/research.md, docs/RISKS.md (top-5 threat model, written clean-room statement), docs/STATUS.md, src/, test/, script/, README with deploy runbook. Final reply ≤300 words: what shipped, pasted test output, [UNVERIFIED] list, open questions. Without shell or web access, say so and label all code untested.

EVIDENCE RULES
Cite a URL or explorer/RPC output for every factual claim. Tag unconfirmed claims [UNVERIFIED]. Say "I don't know" and what would resolve it rather than guess. Web-check Quench/qINJ/QNCH for name collisions and report; don't certify availability. Stop and ask before: mainnet, touching keys or funds, installing unapproved tools, or if live docs contradict a FACT in a way that changes the design.

FINAL PASS (group 5, max 3 rounds)
Re-run all tests. Attack your design as a skeptical auditor: list 10 ways to steal funds, freeze redemptions or desync accounting; test or refute each. Check every cited URL was fetched and every spec claim has a source. Repeat until a pass finds nothing new; report each round in one line.
