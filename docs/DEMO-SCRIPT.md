# Demo script — 90 seconds

Goal: show every BRIEF flow live in the simulated UI, with honest risk states. Total ≈ 85 seconds. Start from a clean simulated state (hard-reload `/`).

Say the plain-language names, not the protocol's internal ones: *collateral vault*, *the protocol*,
*swap buffer*, *auto-repay*. Never `Basin`, `Wellspring` or `Confluence` on camera.

| T | Screen / route | What to do / say | State shown |
|---|---|---|---|
| 0:00 | `/` (landing) | Point at the hero curve: "Deposit stINJ, borrow qINJ, and the staking yield pays the loan down. That's the whole loop — 65 months in this scenario, not a promise." | Simulated badge visible |
| 0:10 | `/` → curve lab | Drag LTV to 50% / APR to 7.53%; the months readout moves. "The curve is the product. Change the APR and the zero-debt date moves." Open **Sources** — show the APR source and date. | Interactive curve |
| 0:20 | `/app` | "Open the instrument" → connect simulated wallet. "This is a local account. No wallet extension, no keys, nothing leaves the browser." | Connect gate (pending → confirmed) |
| 0:28 | `/app/loans` | Add 200 stINJ collateral (do not submit yet). "Collateral value comes from the LST exchange rate, never a DEX." | After-values update live |
| 0:35 | `/app/loans` | Borrow 90 qINJ. "Debt rises by the borrow. The 0.50% fee leaves your stINJ collateral — headroom drops a little. That's the trade." | Borrow confirmed; headroom 9.77 INJ |
| 0:45 | `/app/positions` | "The protocol uses qINJ from your wallet to pay the debt as the exchange rate rises." Fast-forward 1 year (+ simulation). "About a third of the debt cooled with no payment from you." | Repayment history, debt falling |
| 0:55 | `/app/swap` | Redeem 10 qINJ. "You receive stINJ, not INJ. Worst case is 7 days if the buffer is empty — never the 21-day unbonding." | Redeem confirmed, buffer gauge |
| 1:05 | `/app` (Overview) | Fast-forward to zero debt. "At zero debt the withdraw exit is open — even when borrowing and auto-repay are paused. Pausing never blocks an honest exit." | Debt is zero banner, headroom 100% |
| 1:15 | `/app/withdraw` | Withdraw remaining collateral. | Withdraw confirmed |
| 1:20 | Simulation dock | Show the desk briefly: "Same UI, three clients. The protocol owns the real one." Close it. | Simulation controls |
| 1:25 | — | Closing line: "Every button above was real. The wallet, the RPC and the contracts are simulated — the client seam is what the integration will replace." | — |

**Fallback if the clock is slow:** the engine test `keeps debt non-negative over a long horizon` proves the full horizon; the UI fast-forward may need two clicks for a small collateral top-up. The demo still lands inside 90s on the prepared state (200 stINJ, 90 qINJ, 5× +1 year).
