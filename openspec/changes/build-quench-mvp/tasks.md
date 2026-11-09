# Tasks: build-quench-mvp

## 1. Research

- [ ] 1.1 Inventory installed skills, MCP servers and tools (Injective docs MCP, injective-evm-developer, Trail of Bits skills, Foundry, Slither, web search/fetch); record present, versions and missing in `docs/research.md`. Evidence: inventory table plus explicit missing-tool list.
- [ ] 1.2 Fetch `docs.injective.network/llms.txt` and the EVM, precompile, WINJ and testnet-faucet pages; record URL, fetch date and extracted claim for each. Evidence: claims-register rows with live URLs and dates.
- [ ] 1.3 Verify the 0x66 staking precompile ABI from InjectiveLabs/solidity-contracts `demos/staking` and prove each planned call on testnet 1439. Evidence: source URL, ABI, RPC/tx output, or the exact blocker and `[UNVERIFIED]` status.
- [ ] 1.4 Re-confirm chain IDs 1776/1439, testnet RPC and precompile addresses (Bank 0x64, Exchange 0x65, Staking 0x66, Swap 0x68). Evidence: `eth_chainId` RPC output plus docs URLs.
- [ ] 1.5 Build the LST decision matrix for Hydro hINJ/yINJ and Accumulated stINJ/wstINJ: audits, admin/upgrade powers, exchange-rate function, redeem path, DEX liquidity, contract-measurable yield. Evidence: matrix in `docs/research.md` with a URL per cell.
- [ ] 1.6 Select one LST; verify its source on the explorer and its current testnet address; read the exchange-rate and redeem functions; exercise read-only calls. Evidence: explorer URLs, address, ABI and RPC return values.
- [ ] 1.7 Read Alchemix docs and the V3 Immunefi/Cantina reports; extract bug classes into a test checklist. Read each LICENSE before code and quote no code. Evidence: report URLs and a bug-class → invariant/test table.
- [ ] 1.8 Record current INJ staking APR with source and date; derive the APR scenarios used later. Evidence: URL, date, APR and calculation.
- [ ] 1.9 Web-check Quench, qINJ and QNCH for name collisions; report results without certifying availability. Evidence: queries, top results and collision notes.
- [ ] 1.10 Read each Alchemix repository LICENSE; report BUSL 1.1 obligations and the friendly-fork route; flag unresolved legal risk. Evidence: LICENSE URLs, quoted terms (no code) and risk note.
- [ ] 1.11 Confirm InjectiveLabs' patched Foundry is available locally, or record the mock-precompile plan and which tests use mocks. Evidence: `forge --version`/release URL or exact blocker.
- [ ] 1.12 Verify WINJ and testnet faucet details and whether the MVP needs either. Evidence: URLs, addresses and RPC output.

## 2. Specs & design

- [ ] 2.1 Write delta specs for `basin`, `qinj`, `wellspring`, `confluence` and `protocol-safety`; every requirement cites a source or is tagged `[DECISION]`. Evidence: spec files plus `openspec validate build-quench-mvp --strict`.
- [ ] 2.2 Update `design.md` D1–D10 with research evidence and resolve every open question that affects specs. Evidence: each decision has a URL/RPC citation or a `[DECISION]` tag plus resolved question.
- [ ] 2.3 Define and document the slashing/rate-drop policy and parameters. Evidence: protocol-safety spec scenario, design entry and planned invariant test.
- [ ] 2.4 Define the Confluence redemption route, worst-case delay and fee/term. Evidence: confluence spec scenario and design entry.
- [ ] 2.5 Write `docs/RISKS.md` with the top-5 threat model and a written clean-room statement; map each threat to an invariant. Evidence: file plus threat → invariant table.
- [ ] 2.6 Refresh groups 3–5 of this file from research findings; every task must name its evidence. Evidence: diff and a task/evidence audit.
- [ ] 2.7 Update every claim in `docs/research.md` to verified, refuted or `[UNVERIFIED]`; remove unsourced claims. Evidence: claims-register rows with source, date and status.
- [ ] G1 — stop: user reviews specs and design before any src/. Evidence: user review recorded in `docs/STATUS.md`; no `src/` exists before approval.

## 3. Implement

- [ ] 3.1 Scaffold the Foundry project with a pinned toolchain and dependencies; no unapproved installs. Evidence: `forge --version`, `forge build` on the scaffold and a dependency lock.
- [ ] 3.2 Implement the LST adapter and rate-source interface plus a mock. Evidence: unit tests for rate reads, decimals and staleness.
- [ ] 3.3 Implement qINJ as an ERC-20 with mint/burn restricted to the Basin. Evidence: unit and access-control tests.
- [ ] 3.4 Implement Basin deposit/withdraw and per-account collateral/debt accounting. Evidence: unit tests plus the accounting invariant.
- [ ] 3.5 Implement qINJ mint/burn with maxLTV enforcement. Evidence: fuzz tests proving the LTV bound.
- [ ] 3.6 Implement Wellspring harvest from exchange-rate deltas and debt repayment. Evidence: unit and fuzz tests.
- [ ] 3.7 Implement Confluence redemption in LST units. Evidence: unit and fuzz tests.
- [ ] 3.8 Implement rate staleness/bounds pause and LST upgrade/deprecation pause while exits stay open. Evidence: tests for each pause path and exit behavior.
- [ ] 3.9 Implement the slashing/rate-drop path. Evidence: tests for liquidation or socialisation as specified.
- [ ] 3.10 Implement the timelocked admin and QNCH interface stub. Evidence: timelock and interface tests.
- [ ] 3.11 Write the testnet-1439 deploy script. Evidence: `forge script` dry-run or anvil-fork output.
- [ ] 3.12 Write the README deploy runbook. Evidence: every documented command run as written.

## 4. Verify

- [ ] 4.1 Run `forge build` and `forge test`; paste run counts. Evidence: command output in `docs/STATUS.md`.
- [ ] 4.2 Run the invariant suite: per-account earmark/debt sums equal global; redemptions cannot freeze; fees bounded; rounding never favours the user; LST donation/inflation; reentrancy. Evidence: invariant test names and output.
- [ ] 4.3 Fuzz that mint, withdraw, harvest and redeem preserve `collateralValue × maxLTV ≥ debt`, including the rate-drop path. Evidence: fuzz output.
- [ ] 4.4 Run Slither and triage every finding; no unresolved high/medium. Evidence: report path and triage table.
- [ ] 4.5 Simulate debt-repayment time for at least three LTV/APR scenarios. Evidence: script output table with sourced APR and date.
- [ ] 4.6 Execute testnet-1439 end-to-end: deposit → mint → yield accrues → harvest reduces debt → redeem → withdraw. Evidence: explorer-verified addresses and tx hashes, or the exact blocker.
- [ ] 4.7 Audit that every design choice cites a source or `[DECISION]` and every spec claim has a source. Evidence: audit table in `docs/research.md`.
- [ ] 4.8 Audit that every cited URL was fetched, with date and status. Evidence: link log in `docs/research.md`.
- [ ] 4.9 Update `docs/STATUS.md` and tick every completed task with its evidence. Evidence: file diff.

## 5. Final pass

- [ ] 5.1 Round 1: re-run all tests; list 10 ways to steal funds, freeze redemptions or desync accounting and test or refute each. Evidence: test output and one-line round report.
- [ ] 5.2 Round 2: repeat the full pass; record new findings and fixes. Evidence: test output and one-line round report.
- [ ] 5.3 Round 3: repeat until a pass finds nothing new; if not converged, stop and report. Evidence: test output and one-line round report.
- [ ] 5.4 Final consistency pass across BRIEF, research, RISKS, STATUS, README, AGENTS and OpenSpec artifacts. Evidence: consistency checklist.
- [ ] 5.5 Write the final reply (≤300 words): what shipped, pasted test output, `[UNVERIFIED]` list and open questions. Evidence: final message.
