import { FrictionIncident } from './types.js';

export class PlaywrightGenerator {
  /**
   * Generates a fully executable Playwright test script reproducing user friction points.
   */
  public static generateReproTest(incidents: FrictionIncident[]): string {
    const lines: string[] = [
      `import { test, expect } from '@playwright/test';`,
      ``,
      `test.describe('InteractionGap Automated Friction Reproduction Suite', () => {`
    ];

    if (incidents.length === 0) {
      lines.push(`  test('No friction incidents recorded', async ({ page }) => {`);
      lines.push(`    // All interactions were responsive and accessible`);
      lines.push(`  });`);
    } else {
      for (const incident of incidents) {
        lines.push(`  test('reproduce ${incident.frictionType}: ${incident.targetSelector}', async ({ page }) => {`);
        lines.push(`    await page.goto('${incident.pageUrl}');`);
        lines.push(`    // ${incident.description}`);

        if (incident.frictionType === 'RAGE_CLICK') {
          lines.push(`    const target = page.locator('${incident.targetSelector}');`);
          lines.push(`    await expect(target).toBeVisible();`);
          lines.push(`    for (let i = 0; i < 3; i++) {`);
          lines.push(`      await target.click({ delay: 150 });`);
          lines.push(`    }`);
          lines.push(`    // Verify that interface provides responsive visual or state update`);
          lines.push(`    await expect(page.locator('.toast, [role="alert"], [data-loading]')).toBeVisible();`);
        } else if (incident.frictionType === 'DEAD_CLICK') {
          lines.push(`    const element = page.locator('${incident.targetSelector}');`);
          lines.push(`    await element.click();`);
          lines.push(`    // Ensure clickable appearance has cursor: pointer or interactive role`);
          lines.push(`    const cursor = await element.evaluate(el => window.getComputedStyle(el).cursor);`);
          lines.push(`    expect(cursor).not.toBe('pointer');`);
        } else if (incident.frictionType === 'MISSING_ACCESSIBILITY_LABEL') {
          lines.push(`    const control = page.locator('${incident.targetSelector}');`);
          lines.push(`    const accessibleName = await control.evaluate(el => (el as HTMLElement).innerText || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));`);
          lines.push(`    expect(accessibleName && accessibleName.trim().length > 0).toBeTruthy();`);
        }

        lines.push(`  });`);
        lines.push(``);
      }
    }

    lines.push(`});`);
    return lines.join('\n');
  }
}
