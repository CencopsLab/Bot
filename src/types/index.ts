export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
};

export type ScanVerdict = 'safe' | 'suspicious' | 'malicious' | 'unknown';

export type ScanResult = {
  verdict: ScanVerdict;
  summary: string;
  detectionRatio?: string;
  threatName?: string;
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
