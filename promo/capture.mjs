/**
 * Quench promo capture.
 *
 * Deterministic Playwright screenshots of the real simulated app at 2x DPR.
 * No recording, no redrawn UI. State is read from the app's own localStorage
 * after every action and written to promo/facts.json.
 *
 * Usage: node promo/capture.mjs
 * Requires: web/ preview server on http://127.0.0.1:4173
 */
import { createRequire } from 'node:module';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'capture');
const BASE = process.env.QUENCH_URL ?? 'http://127.0.0.1:4173';
const ONE = 10n ** 18n;

const fmt = (v, dp = 2) => {
  const n = Number(v) / 1e18;
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
const page = await context.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') console.error('CONSOLE', m.text());
});

const facts = {
  generatedAt: new Date().toISOString(),
  source: 'web/src/client/simulated/engine.ts via localStorage quench.demo.v1',
  aprBps: 753,
  aprSource: 'Staking Rewards — Injective, 2026-11-09 (docs/research.md U14)',
  maxLtvBps: 5000,
  mintFeeBps: 50,
  redeemFeeBps: 50,
  redemptionDelayDays: 7,
  bufferLst: '500.00',
  steps: {},
};

const state = async () => {
  const raw = await page.evaluate(() => localStorage.getItem('quench.demo.v1'));
  if (!raw) return null;
  return JSON.parse(raw);
};

const read = (s, key) => {
  const v = s?.[key];
  return v && typeof v === 'object' ? BigInt(v.__quenchBigInt) : 0n;
};

const snapshot = async (label) => {
  const s = await state();
  const collateral = read(s, 'collateralLst');
  const debt = read(s, 'debtQinj');
  const rate = read(s, 'rate');
  const value = (collateral * rate) / ONE;
  const maxDebt = (value * 5000n) / 10000n;
  const step = {
    label,
    collateralLst: fmt(collateral),
    debtQinj: fmt(debt),
    qinjBalance: fmt(read(s, 'qinjBalance')),
    walletLst: fmt(read(s, 'walletLst')),
    bufferLst: fmt(read(s, 'bufferLst')),
    rate: fmt(rate, 4),
    collateralValueInj: fmt(value),
    ltvPct: value > 0n ? Number((debt * 10000n) / value) / 100 : 0,
    headroomInj: fmt(maxDebt > debt ? maxDebt - debt : 0n),
    simulatedNow: new Date(s?.now ?? 0).toISOString(),
    redemptions: s?.redemptions?.length ?? 0,
  };
  facts.steps[label] = step;
  console.log(label, JSON.stringify(step));
  return step;
};

let shotIndex = 0;
const snap = async (name, locator = null) => {
  const idx = String(shotIndex++).padStart(2, '0');
  if (locator) {
    await locator.screenshot({ path: join(OUT, `${idx}-${name}.png`), animations: 'disabled' });
  } else {
    await page.screenshot({ path: join(OUT, `${idx}-${name}.png`), animations: 'disabled' });
  }
  console.log('shot', `${idx}-${name}`);
};

const connect = async () => {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.setItem('quench-theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
  });
  await page.waitForTimeout(250);
  await page.getByTestId('connect-button').click();
  await page.waitForTimeout(900);
};

const waitTx = async () => {
  await page.getByTestId('tx-panel').getByText('Confirmed').waitFor({ timeout: 10_000 });
  await page.waitForTimeout(250);
};

const openPosition = async () => {
  await page.goto(`${BASE}/app/loans`, { waitUntil: 'networkidle' });
  await page.getByTestId('loan-deposit-input').fill('200');
  await page.getByTestId('mint-input').fill('90');
  await snap('loans-filled', page.locator('section.card').first());
  await page.getByTestId('mint-submit').click();
  await waitTx();
  await snap('loans-minted', page.locator('section.card').first());
  await snapshot('minted');
};

const fast = async (testId, label) => {
  await page.getByTestId('sim-open').click();
  await page.waitForTimeout(250);
  await page.getByTestId(testId).first().click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  await snapshot(label);
};

// ---------------------------------------------------------------- session A
await connect();
await snap('dashboard');
await snapshot('connected');

await page.goto(`${BASE}/app/loans`, { waitUntil: 'networkidle' });
await snap('loans-empty');
await snap('loans-empty-card', page.locator('section.card').first());

await openPosition();

await page.goto(`${BASE}/app/positions`, { waitUntil: 'networkidle' });
await snap('pos-90');
await snap('pos-90-card', page.locator('section.card').first());
await snapshot('positions-debt-90');

await fast('sim-fast-365', 'after-1y');
await snap('pos-after-1y');
await snap('pos-after-1y-card', page.locator('section.card').first());

await fast('sim-fast-1825', 'after-6y');
await snap('pos-after-6y');
await snap('pos-after-6y-card', page.locator('section.card').first());

let s = await state();
for (let i = 0; i < 8 && read(s, 'debtQinj') > 0n; i += 1) {
  await fast('sim-fast-1825', `after-extra-${i + 1}`);
  s = await state();
}
await snap('pos-zero');
await snap('pos-zero-card', page.locator('section.card').first());
await snapshot('positions-zero');

await page.goto(`${BASE}/app/basin`, { waitUntil: 'networkidle' });
await page.getByLabel('Amount to withdraw').fill('199.55');
await snap('basin-withdraw-filled', page.locator('section.card').first());
await page.getByTestId('withdraw-submit').click();
await waitTx();
await snap('basin-withdrawn', page.locator('section.card').first());
await snapshot('withdrawn');

// ---------------------------------------------------------------- session B
// Redeeming lowers qINJ below debt, so zero-debt needs a clean session.
await page.getByTestId('sim-open').click();
await page.waitForTimeout(250);
await page.getByTestId('sim-reset').click();
await page.waitForTimeout(700);
await page.keyboard.press('Escape');
await connect();
await page.goto(`${BASE}/app/loans`, { waitUntil: 'networkidle' });
await page.getByTestId('loan-deposit-input').fill('200');
await page.getByTestId('mint-input').fill('90');
await page.getByTestId('mint-submit').click();
await waitTx();
await snapshot('redeem-position');

await page.goto(`${BASE}/app/swap`, { waitUntil: 'networkidle' });
await snap('swap-empty');
await snap('swap-empty-card', page.locator('section.card').first());
await page.getByTestId('redeem-input').fill('10');
await snap('swap-redeem-filled', page.locator('section.card').first());
await page.getByTestId('redeem-submit').click();
await waitTx();
await snap('swap-redeemed', page.locator('section.card').first());
await snapshot('redeemed');
await page.waitForTimeout(400);
await snap('swap-redeemed-full');

// ---------------------------------------------------------------- write facts
await writeFile(join(ROOT, 'facts.json'), `${JSON.stringify(facts, null, 2)}\n`);
console.log('wrote facts.json');
await browser.close();
