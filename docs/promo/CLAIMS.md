# Claims register — promo film

Every on-screen number. If it is not here, it is not in the film. Dates are fetch dates.

| # | Claim (on-screen wording) | Source | Date | Status |
|---|---|---|---|---|
| 1 | Loans: Add 200 stINJ · borrow 90 qINJ → collateral 199.55 stINJ (one atomic transaction) | `promo/facts.json` `minted.collateralLst`; `web/src/client/config.ts` (fee 0.50%); `web/src/client/simulated/engine.ts` `depositAndMintState` | 2026-11-10 | VERIFIED — engine state, not a promise |
| 2 | Borrow 90.00 qINJ | `promo/facts.json` `minted`; `web/src/client/simulated/engine.ts` `depositAndMintState` | 2026-11-10 | VERIFIED — simulated action |
| 3 | LTV 45.10%, headroom 9.78 INJ (engine) / 9.77 displayed (truncated), max LTV 50.00% | `promo/facts.json` `ltvPct`/`headroomInj`; `web/src/client/config.ts` `maxLtvBps: 5000` | 2026-11-10 | VERIFIED in app; max LTV is [DECISION] illustrative in `web/src/client/config.ts` SOURCES |
| 4 | APR 7.53% | Staking Rewards — Injective, https://stakingrewards.com/asset/injective-protocol; `docs/research.md` U14 | 2026-11-09 | VERIFIED as a fetched headline rate; the film labels it an assumption |
| 5 | Positions: Debt 90.00 → 74.44 → 0.00 qINJ after 1 y then 5 y at 7.53% | `promo/facts.json` `after-1y`/`after-6y` | 2026-11-10 | VERIFIED — simulated scenario at the stated APR |
| 6 | Collateral value 199.55 → 313.09 INJ | `promo/facts.json` `positions-zero.collateralValueInj` | 2026-11-10 | VERIFIED — simulated scenario |
| 7 | Withdraw 199.55 stINJ at zero debt → wallet 249.55 stINJ | `promo/facts.json` `withdrawn` | 2026-11-10 | VERIFIED — simulated action |
| 8 | Swap: Redeem 10 qINJ → 9.95 stINJ, fee 0.05 qINJ | `promo/facts.json` `redeemed`; `web/src/client/config.ts` `redeemFeeBps: 50` | 2026-11-10 | VERIFIED — simulated action; fee is [DECISION] illustrative |
| 9 | Redemption worst case 7 days, payout in LST units | `web/src/client/config.ts` `redemptionDelayDays: 7`; `docs/BRIEF.md` hard rule | 2026-11-10 | VERIFIED in app; the 7 days is [DECISION] illustrative, never "instant INJ" and never 21-day unbonding |
| 10 | Swap buffer 500 stINJ; buffer 490.05 stINJ after redemption | `promo/facts.json` `bufferLst`; `web/src/client/simulated/engine.ts` `redeemState` | 2026-11-10 | VERIFIED in app; [DECISION] illustrative reserve |
| 11 | "Simulated demo · contracts not deployed" | `docs/BRIEF.md`; `web/src/client/config.ts` note "None of these values is a production parameter" | 2026-11-09 | REMOVED from the film 2026-11-10 at user request — the line is no longer on screen. The disclosure still lives in the app UI (`Simulated` badge) and in the demo script |
| 12 | Network: Injective EVM testnet 1439 | `web/src/client/config.ts` SOURCES `chain`; https://docs.injective.network/developers-evm/network-information | 2026-11-09 | VERIFIED as a chain identifier; the demo does not connect to it |

## Excluded (never claimed)

TVL, user count, live yield, audits, partners, mainnet, "live", "secure", "backed" beyond the simulation. Any of these would need a fresh source and a new row here; none is in the film.
