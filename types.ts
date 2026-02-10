export enum AppView {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
}

export enum SubscriptionTier {
  GROWTH = 'GROWTH',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface BusinessProfile {
  name: string;
  url: string;
  phone: string;
  industry: string;
  description: string;
  hours: string;
  services: string[];
  tier: SubscriptionTier;
  voiceId?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  tone: string;
  gender: string;
  description: string;
  sampleText: string;
}

export interface CallLog {
  id: string;
  callerNumber: string;
  timestamp: string;
  duration: string;
  summary: string;
  outcome: 'BOOKED' | 'INFO_GIVEN' | 'UPSELL_SUCCESS' | 'MISSED';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  transcriptSnippet: string;
  revenueImpact: number;
  fullTranscript?: string;
  recordingUrl?: string;
}

export interface RevenueInsight {
  id: string;
  title: string;
  description: string;
  type: 'OPPORTUNITY' | 'WARNING' | 'OPTIMIZATION';
  projectedRoi: string;
  actionParams: string; // e.g., "Activate SMS campaign"
}

export interface ChartDataPoint {
  name: string;
  revenue: number;
  calls: number;
  missed: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string;
  endTime: string;
}