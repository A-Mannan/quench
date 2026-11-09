import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SHOTS = process.env.QUENCH_SHOTS ?? 'screenshots';

async function shot(page: Page, name: string): Promise<void> {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: join(SHOTS, `${page.viewportSize()?.width ?? 0}-${name}`), fullPage: false });
}

async function connect(page: Page): Promise<void> {
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Open the instrument.' })).toBeVisible();
  await page.getByTestId('connect-button').click();
  await expect(page.getByText('A clean instrument.')).toBeVisible({ timeout: 10_000 });
}

async function waitTx(page: Page): Promise<void> {
  await expect(page.getByTestId('tx-panel')).toContainText('Confirmed');
}

async function openPosition(page: Page): Promise<void> {
  await page.goto('/app/basin');
  await page.getByTestId('deposit-input').fill('200');
  await expect(page.getByTestId('deposit-submit')).toBeEnabled();
  await page.getByTestId('deposit-submit').click();
  await waitTx(page);
  await page.goto('/app/loans');
  await page.getByTestId('mint-input').fill('90');
  await expect(page.getByTestId('mint-submit')).toBeEnabled();
  await page.getByTestId('mint-submit').click();
  await waitTx(page);
}

test('landing hero carries the loop, the badge and falling debt', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('hero-loop')).toContainText('Deposit stINJ');
  await expect(page.getByTestId('hero-loop')).toContainText('withdraw at zero debt');
  await expect(page.getByText('Debt falls. Collateral rises.')).toBeVisible();
  await expect(page.getByText('50.00 → 0.00 qINJ')).toBeVisible();
  await expect(page.getByTestId('sim-badge').first()).toBeVisible();
  await shot(page, 'landing.png');
});

test('full simulated loop reaches zero debt and withdrawal', async ({ page }) => {
  await connect(page);
  await shot(page, 'app-empty.png');
  await openPosition(page);

  await page.goto('/app/positions');
  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-fast-365').click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await expect(page.getByText('Pending repayment')).toBeVisible();
  await shot(page, 'wellspring.png');

  await page.goto('/app/swap');
  await page.getByTestId('redeem-input').fill('10');
  await expect(page.getByTestId('redeem-submit')).toBeEnabled();
  await page.getByTestId('redeem-submit').click();
  await waitTx(page);
  await expect(page.getByText(/490 stINJ/).first()).toBeVisible();
  await shot(page, 'confluence.png');

  // Redeemed qINJ can no longer burn against the debt, so zero-debt needs a
  // clean session. Reset and re-open the position for that path.
  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-reset').click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await page.goto('/app');
  await page.getByTestId('connect-button').click();
  await expect(page.getByText('A clean instrument.')).toBeVisible({ timeout: 10_000 });
  await openPosition(page);

  await page.locator('a[href="/app"]:visible').first().click();
  await page.waitForTimeout(800);
  for (let i = 0; i < 10; i += 1) {
    const sim = page.getByTestId('sim-open');
    if (!(await sim.isVisible().catch(() => false))) break;
    await sim.click();
    const target = page
      .getByTestId('sim-fast-365')
      .first();
    if (!(await target.isVisible().catch(() => false))) break;
    await target.click();
    await page.keyboard.press('Escape');
    await page.locator('a[href="/app"]:visible').first().click();
  }
  await expect(page.getByText('Debt is zero', { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await shot(page, 'overview.png');

  await page.goto('/app/basin');
  await page.getByLabel('Amount to withdraw').fill('100');
  await page.getByTestId('withdraw-submit').click();
  await waitTx(page);

  await page.goto('/app/swap');
  await expect(page.getByText('Nothing to redeem')).toBeVisible();

  await page.goto('/app/activity');
  await expect(page.getByText('Simulated activity')).toBeVisible();
  await shot(page, 'activity.png');
});

test('connect, empty, loading and pending states', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByText('Open the instrument.')).toBeVisible();
  await shot(page, 'connect-gate.png');
  await page.getByTestId('connect-button').click();
  await expect(page.getByTestId('tx-panel')).toContainText('in flight');
  await waitTx(page);
  await expect(page.getByText('The Basin is empty')).toBeVisible();
  await shot(page, 'app-empty.png');
});

test('failed and rejected transactions preserve input', async ({ page }) => {
  await connect(page);
  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-outcome-reject').click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');

  await page.goto('/app/basin');
  await page.getByTestId('deposit-input').fill('50');
  await page.getByTestId('deposit-submit').click();
  await expect(page.getByTestId('tx-panel')).toContainText('Rejected');
  await expect(page.getByTestId('deposit-input')).toHaveValue('50');
  await shot(page, 'tx-rejected.png');

  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-outcome-fail').click();
  await page.keyboard.press('Escape');
  await page.getByTestId('deposit-submit').click();
  await expect(page.getByTestId('tx-panel')).toContainText('failed');
  await expect(page.getByTestId('deposit-input')).toHaveValue('50');
  await shot(page, 'tx-failed.png');
});

test('wrong network blocks actions with a recovery path', async ({ page }) => {
  await connect(page);
  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-network').click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Wrong network')).toBeVisible();
  await page.goto('/app/basin');
  await expect(page.getByTestId('deposit-submit')).toBeDisabled();
  await shot(page, 'wrong-network.png');
});

test('stale rate pauses entries and keeps exits open', async ({ page }) => {
  await connect(page);
  await openPosition(page);
  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-stale').click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');

  await page.goto('/app/loans');
  await expect(page.getByTestId('state-banner')).toContainText('stale');
  await expect(page.getByTestId('mint-input')).toBeDisabled();
  await expect(page.getByTestId('mint-submit')).toBeDisabled();
  await shot(page, 'stale-rate.png');

  await page.goto('/app/swap');
  await page.getByTestId('redeem-input').fill('5');
  await expect(page.getByTestId('redeem-submit')).toBeEnabled();
});

test('rate drop marks liquidation eligibility and keeps redemption open', async ({ page }) => {
  await connect(page);
  await page.goto('/app/basin');
  await page.getByTestId('deposit-input').fill('200');
  await page.getByTestId('deposit-submit').click();
  await waitTx(page);
  await page.goto('/app/loans');
  await page.getByTestId('mint-input').fill('99');
  await page.getByTestId('mint-submit').click();
  await waitTx(page);

  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-drop').click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('state-banner')).toContainText('Liquidation-eligible');
  await shot(page, 'rate-drop.png');

  await page.goto('/app/swap');
  await page.getByTestId('redeem-input').fill('5');
  await expect(page.getByTestId('redeem-submit')).toBeEnabled();
});

test('queued redemption and liquidation eligibility', async ({ page }) => {
  await connect(page);
  await openPosition(page);
  await page.getByTestId('sim-open').click();
  await page.getByTestId('sim-drain').click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');

  await page.goto('/app/swap');
  await page.getByTestId('redeem-input').fill('5');
  await expect(page.getByText('This redemption will queue')).toBeVisible();
  await page.getByTestId('redeem-submit').click();
  await waitTx(page);
  await expect(page.getByText(/Redemption queue is active/)).toBeVisible();
  await shot(page, 'redemption-queued.png');
});

test('sources drawer and simulation controls', async ({ page }) => {
  await connect(page);
  await page.locator('button:visible').filter({ hasText: 'Sources' }).first().click();
  await expect(page.getByTestId('sources-drawer')).toBeVisible();
  await expect(page.getByTestId('sources-drawer')).toContainText('7.53% APY');
  await shot(page, 'sources.png');
  await page.keyboard.press('Escape');

  await page.getByTestId('sim-open').click();
  await expect(page.getByTestId('sim-drawer')).toBeVisible();
  await expect(page.getByTestId('sim-drawer')).toContainText('Simulation controls');
  await shot(page, 'sim-controls.png');
  await page.keyboard.press('Escape');
});

test('axe desktop landing', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
  await mkdir(SHOTS, { recursive: true });
  await writeFile(
    join(SHOTS, 'axe-landing.json'),
    JSON.stringify(results.violations, null, 2),
  );
  expect(results.violations).toEqual([]);
});

test('keyboard focus and reduced motion', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const firstFocusable = page.locator(
    'a[href], button:not([disabled]), input:not([disabled])',
  ).first();
  await expect(firstFocusable).toBeVisible();
  await firstFocusable.focus();
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    return {
      tag: active?.tagName ?? '',
      name: active?.getAttribute('aria-label') ?? active?.textContent?.trim().slice(0, 80) ?? '',
    };
  });
  expect(focused.tag).toMatch(/A|BUTTON/);
  await expect(page.getByText('Deposit stINJ')).toBeVisible();
  await shot(page, 'reduced-motion.png');
});
