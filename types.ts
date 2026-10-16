export type FrictionType =
  | 'RAGE_CLICK'
  | 'DEAD_CLICK'
  | 'KEYBOARD_TRAP'
  | 'FORM_ABANDONMENT'
  | 'MISSING_ACCESSIBILITY_LABEL';

export interface TelemetryEvent {
  id: string;
  timestampMs: number;
  type: 'click' | 'keydown' | 'blur' | 'error';
  targetSelector: string;
  targetTagName: string;
  hasAccessibleName: boolean;
  isInteractiveElement: boolean;
  domChangedAfterEvent: boolean;
  pageUrl: string;
}

export interface FrictionIncident {
  id: string;
  frictionType: FrictionType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  targetSelector: string;
  eventCount: number;
  timeWindowMs: number;
  description: string;
  pageUrl: string;
  reproductionHint: string;
}

export interface InteractionAuditReport {
  sessionId: string;
  totalEventsAnalyzed: number;
  frictionCount: number;
  incidents: FrictionIncident[];
  playwrightScript: string;
}
