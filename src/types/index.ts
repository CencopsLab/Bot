export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
};

export type ScanVerdict = 'safe' | 'likely_safe' | 'suspicious' | 'malicious' | 'unknown';

export type ScanCheck = {
  name: string;
  status: 'pass' | 'warning' | 'unavailable' | 'info';
  detail: string;
};

export type SmsHeaderDetails = {
  originalHeader: string;
  serviceProviderCode: string | null;
  serviceProvider: string | null;
  serviceAreaCode: string | null;
  serviceArea: string | null;
  header: string;
  principalEntityName: string | null;
  categoryCode: string | null;
  category: string | null;
};

export type UrlAssessment = {
  status: 'available' | 'unavailable';
  riskScore: number | null;
  recommendation: 'avoid' | 'caution' | 'no_obvious_risk' | 'unavailable';
  reason: string;
};

export type ScanGuidance = {
  findings: string[];
  meaning: string;
  actions: string[];
  verdict: ScanVerdict;
};

export type ScanResult = {
  verdict: ScanVerdict;
  summary: string;
  detectionRatio?: string;
  threatName?: string;
  permissions?: string[];
  checks?: ScanCheck[];
  headerDetails?: SmsHeaderDetails;
  urlAssessment?: UrlAssessment;
  scanType?: 'url' | 'file' | 'email' | 'sms' | 'mobile';
  guidance?: ScanGuidance;
  scannedTarget: string;
  scannedAt: number;
};

export type PoliceStation = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
};

export type ImportantContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
  description: string;
};

export type ServiceLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
};

export type Handbook = {
  id: string;
  title: string;
  summary: string;
  content: string;
  pdfUrl?: string;
};
