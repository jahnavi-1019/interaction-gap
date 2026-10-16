import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TelemetryEvent } from './types.js';
import { FrictionDetector } from './friction-detector.js';
import { PlaywrightGenerator } from './playwright-gen.js';

test('InteractionGap Detector: detects rage clicks within 1-second burst window', () => {
  const events: TelemetryEvent[] = [
    {
      id: 'e1',
      timestampMs: 1000,
      type: 'click',
      targetSelector: 'button#checkout-btn',
      targetTagName: 'BUTTON',
      hasAccessibleName: true,
      isInteractiveElement: true,
      domChangedAfterEvent: false,
      pageUrl: 'https://app.test/cart'
    },
    {
      id: 'e2',
      timestampMs: 1200,
      type: 'click',
      targetSelector: 'button#checkout-btn',
      targetTagName: 'BUTTON',
      hasAccessibleName: true,
      isInteractiveElement: true,
      domChangedAfterEvent: false,
      pageUrl: 'https://app.test/cart'
    },
    {
      id: 'e3',
      timestampMs: 1400,
      type: 'click',
      targetSelector: 'button#checkout-btn',
      targetTagName: 'BUTTON',
      hasAccessibleName: true,
      isInteractiveElement: true,
      domChangedAfterEvent: false,
      pageUrl: 'https://app.test/cart'
    }
  ];

  const incidents = FrictionDetector.detectFriction(events);
  assert.equal(incidents.length, 1);
  assert.equal(incidents[0].frictionType, 'RAGE_CLICK');
  assert.equal(incidents[0].targetSelector, 'button#checkout-btn');
});

test('InteractionGap Detector: detects dead clicks and accessibility gaps', () => {
  const events: TelemetryEvent[] = [
    {
      id: 'e4',
      timestampMs: 2000,
      type: 'click',
      targetSelector: 'div.promo-banner',
      targetTagName: 'DIV',
      hasAccessibleName: false,
      isInteractiveElement: false,
      domChangedAfterEvent: false,
      pageUrl: 'https://app.test/home'
    },
    {
      id: 'e5',
      timestampMs: 2500,
      type: 'click',
      targetSelector: 'button.icon-only',
      targetTagName: 'BUTTON',
      hasAccessibleName: false, // Missing aria-label!
      isInteractiveElement: true,
      domChangedAfterEvent: true,
      pageUrl: 'https://app.test/home'
    }
  ];

  const incidents = FrictionDetector.detectFriction(events);
  assert.equal(incidents.length, 2);
  assert.ok(incidents.some(i => i.frictionType === 'DEAD_CLICK'));
  assert.ok(incidents.some(i => i.frictionType === 'MISSING_ACCESSIBILITY_LABEL'));
});

test('InteractionGap Generator: generates executable Playwright test script', () => {
  const incidents = [
    {
      id: 'i1',
      frictionType: 'RAGE_CLICK' as const,
      severity: 'HIGH' as const,
      targetSelector: '#submit-order',
      eventCount: 3,
      timeWindowMs: 400,
      description: 'Rage click on submit button',
      pageUrl: 'https://app.test/checkout',
      reproductionHint: 'click 3 times'
    }
  ];

  const script = PlaywrightGenerator.generateReproTest(incidents);
  assert.ok(script.includes("@playwright/test"));
  assert.ok(script.includes("page.goto('https://app.test/checkout')"));
  assert.ok(script.includes("#submit-order"));
});
