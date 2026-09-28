import { test, expect, type Page } from '@playwright/test';

/**
 * /process "The training run" — e2e acceptance.
 * The page draws one example project as a quality curve against the bar
 * agreed in Discover: the hero chart draws itself, then five stage controls
 * (Discover, Prototype, Evaluate, Build, Run & improve) drive a sticky chart
 * whose dock shows each stage's artifact. Copy below is the EN message copy.
 */
const STAGES = ['Discover', 'Prototype', 'Evaluate', 'Build', 'Run & improve'];

const stageList = (page: Page) => page.getByRole('list', { name: 'Project stages' });
const stage = (page: Page, name: string) => stageList(page).getByRole('button', { name, exact: true });
const mainPlot = (page: Page) => page.locator('.pr-main-chart .pr-plot');
const heroChart = (page: Page) => page.getByRole('img', { name: /^Example run:/ });

test.describe('process page — training run (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('renders one h1, the hero run and five stage controls in order', async ({ page }) => {
    await page.goto('/process');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(heroChart(page)).toBeVisible();
    const buttons = stageList(page).getByRole('button');
    await expect(buttons).toHaveText(STAGES);
    await expect(stage(page, 'Discover')).toHaveAttribute('aria-current', 'step');
    await expect(stageList(page).locator('[aria-current="step"]')).toHaveCount(1);
  });

  test('the hero chart draws itself to the end of the run', async ({ page }) => {
    await page.goto('/process');
    await expect(heroChart(page)).toHaveAttribute('data-state', 'done', { timeout: 10_000 });
    await expect(heroChart(page).locator('.pr-plot')).toHaveAttribute('data-progress', '1');
  });

  test('activating Evaluate marks it current, shows the eval report and draws to its checkpoint', async ({ page }) => {
    await page.goto('/process');
    await stage(page, 'Evaluate').click();
    await expect(stage(page, 'Evaluate')).toHaveAttribute('aria-current', 'step');
    await expect(stage(page, 'Discover')).not.toHaveAttribute('aria-current', 'step');
    // Only the active artifact in the chart dock is exposed (the inline copies are narrow-screen only).
    await expect(page.getByRole('group', { name: 'Eval report' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Workflow map' })).toHaveCount(0);
    // Evaluate's checkpoint sits at 0.58 of the run.
    await expect(mainPlot(page)).toHaveAttribute('data-progress', '0.58', { timeout: 6_000 });
  });

  test('stage controls work from the keyboard', async ({ page }) => {
    await page.goto('/process');
    await stage(page, 'Build').focus();
    await page.keyboard.press('Enter');
    await expect(stage(page, 'Build')).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('group', { name: 'Production checklist' })).toBeVisible();
  });

  test('scrolling a stage to the middle of the viewport makes it current', async ({ page }) => {
    await page.goto('/process');
    await stage(page, 'Run & improve').evaluate((el) => el.closest('li')?.scrollIntoView({ block: 'center' }));
    await expect(stage(page, 'Run & improve')).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('group', { name: 'Live monitor' })).toBeVisible();
    await expect(mainPlot(page)).toHaveAttribute('data-progress', '1', { timeout: 6_000 });
  });

  test("the loop feed, what we won't do and the closing CTA render", async ({ page }) => {
    await page.goto('/process');
    await expect(page.getByRole('heading', { name: 'How you stay in the loop', level: 2 })).toBeVisible();
    await expect(page.getByText('Needs your call')).toBeVisible();
    await expect(page.getByRole('heading', { name: "What we won't do", level: 2 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'See our services' })).toHaveAttribute('href', /\/services$/);
  });
});

test.describe('process page — training run (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('stages stack with their artifacts inline and nothing scrolls sideways', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('.pr-stick')).toBeHidden();
    const report = page.getByRole('group', { name: 'Eval report' });
    await report.scrollIntoViewIfNeeded();
    await expect(report).toBeVisible();
    await stage(page, 'Evaluate').click();
    await expect(stage(page, 'Evaluate')).toHaveAttribute('aria-current', 'step');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('process page — reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows the fully drawn curve and never advances on its own', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/process');
    await expect(heroChart(page)).toHaveAttribute('data-state', 'done');
    await expect(heroChart(page).locator('.pr-plot')).toHaveAttribute('data-progress', '1');
    await expect(page.getByRole('button', { name: 'Replay the run' })).toBeHidden();
    await expect(mainPlot(page)).toHaveAttribute('data-progress', '1');
    await page.waitForTimeout(3_000);
    await expect(stage(page, 'Discover')).toHaveAttribute('aria-current', 'step');
    // Stages still switch on request; the curve stays whole.
    await stage(page, 'Evaluate').click();
    await expect(stage(page, 'Evaluate')).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('group', { name: 'Eval report' })).toBeVisible();
    await expect(mainPlot(page)).toHaveAttribute('data-progress', '1');
  });
});

test.describe('process page — Bengali', () => {
  test('renders five stages with Bengali numerals', async ({ page }) => {
    await page.goto('/bn/process');
    await expect(page.getByRole('list', { name: 'প্রজেক্টের ধাপ' }).getByRole('button')).toHaveCount(5);
    await expect(page.locator('.pr-stage-n').first()).toHaveText('০১');
  });
});
