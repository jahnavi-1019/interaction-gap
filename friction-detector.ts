import { TelemetryEvent, FrictionIncident, FrictionType } from './types.js';

export class FrictionDetector {
  /**
   * Scans a sequence of user interaction events for usability bottlenecks and accessibility defects.
   */
  public static detectFriction(events: TelemetryEvent[]): FrictionIncident[] {
    const incidents: FrictionIncident[] = [];
    if (events.length === 0) return incidents;

    // 1. Detect Rage Clicks: >= 3 clicks on same selector within 1000ms
    const clickEvents = events.filter(e => e.type === 'click');
    const selectorBuckets = new Map<string, TelemetryEvent[]>();

    for (const e of clickEvents) {
      if (!selectorBuckets.has(e.targetSelector)) {
        selectorBuckets.set(e.targetSelector, []);
      }
      selectorBuckets.get(e.targetSelector)!.push(e);
    }

    for (const [selector, group] of selectorBuckets.entries()) {
      for (let i = 0; i <= group.length - 3; i++) {
        const windowDuration = group[i + 2].timestampMs - group[i].timestampMs;
        if (windowDuration <= 1000) {
          incidents.push({
            id: `rage-${incidents.length + 1}`,
            frictionType: 'RAGE_CLICK',
            severity: 'HIGH',
            targetSelector: selector,
            eventCount: 3,
            timeWindowMs: windowDuration,
            description: `User clicked "${selector}" 3 times within ${windowDuration}ms without receiving responsive feedback.`,
            pageUrl: group[i].pageUrl,
            reproductionHint: `await page.locator('${selector}').click({ clickCount: 3, delay: 100 });`
          });
          break; // Flag once per selector cluster
        }
      }
    }

    // 2. Detect Dead Clicks: Click on non-interactive element that triggered zero DOM or URL mutation
    for (const e of clickEvents) {
      if (!e.isInteractiveElement && !e.domChangedAfterEvent) {
        incidents.push({
          id: `dead-${incidents.length + 1}`,
          frictionType: 'DEAD_CLICK',
          severity: 'MEDIUM',
          targetSelector: e.targetSelector,
          eventCount: 1,
          timeWindowMs: 0,
          description: `User attempted to click static non-interactive element "${e.targetSelector}" expecting action.`,
          pageUrl: e.pageUrl,
          reproductionHint: `await page.locator('${e.targetSelector}').click();`
        });
      }
    }

    // 3. Detect Missing Accessibility Labels on Interactive Controls
    for (const e of events) {
      if (e.isInteractiveElement && !e.hasAccessibleName) {
        incidents.push({
          id: `a11y-${incidents.length + 1}`,
          frictionType: 'MISSING_ACCESSIBILITY_LABEL',
          severity: 'HIGH',
          targetSelector: e.targetSelector,
          eventCount: 1,
          timeWindowMs: 0,
          description: `Interactive control "${e.targetSelector}" lacks aria-label or accessible text for screen readers.`,
          pageUrl: e.pageUrl,
          reproductionHint: `expect(await page.locator('${e.targetSelector}').getAttribute('aria-label')).toBeTruthy();`
        });
      }
    }

    return incidents;
  }
}
