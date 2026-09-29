import { apiClient, toApiError } from './client';
import type { ScanResult, UrlAssessment } from '@/types';

// Backend contract: POST {API_BASE_URL}/api/scan
//  - URL scans:  JSON body { url }
//  - File scans: multipart/form-data with a "file" part
export async function scanUrl(url: string): Promise<ScanResult> {
  try {
    const { data } = await apiClient.post('/api/scan', { url });
    return normalizeScanResult(data, url);
  } catch (error) {
    throw toApiError(error);
  }
}

export type TextScanType = 'email' | 'sms' | 'mobile';

export async function scanText(type: TextScanType, value: string): Promise<ScanResult> {
  try {
    const body = type === 'sms' ? { type, header: value } : { type, value };
    const { data } = await apiClient.post('/api/scan', body);
    return normalizeScanResult(data, value);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function scanFile(
  file: { uri: string; name: string; mimeType?: string | null },
  onUploadProgress?: (percent: number) => void
): Promise<ScanResult> {
  const formData = new FormData();
  // @ts-expect-error React Native FormData file shape differs from the DOM lib types.
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  });

  try {
    const { data } = await apiClient.post('/api/scan', formData, {
      timeout: 0,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onUploadProgress && evt.total) {
          onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return normalizeScanResult(data, file.name);
  } catch (error) {
    throw toApiError(error);
  }
}

function normalizeScanResult(data: any, target: string): ScanResult {
  const verdictRaw = String(data?.verdict ?? data?.status ?? 'unknown').toLowerCase();
  const verdict =
    verdictRaw === 'safe' || verdictRaw === 'likely_safe' || verdictRaw === 'suspicious' || verdictRaw === 'malicious'
      ? verdictRaw
      : 'unknown';

  return {
    verdict,
    summary: data?.summary ?? data?.message ?? 'Scan complete.',
    detectionRatio: data?.detection_ratio ?? data?.detectionRatio,
    threatName: data?.threat_name ?? data?.threatName,
    permissions: Array.isArray(data?.permissions) ? data.permissions : undefined,
    checks: Array.isArray(data?.checks) ? data.checks : undefined,
    headerDetails: data?.headerDetails,
    urlAssessment: normalizeUrlAssessment(data?.urlAssessment),
    scanType: data?.scanType,
    guidance: data?.guidance,
    scannedTarget: target,
    scannedAt: Date.now(),
  };
}

function normalizeUrlAssessment(value: any): UrlAssessment | undefined {
  if (!value || (value.status !== 'available' && value.status !== 'unavailable')) return undefined;
  const recommendations = ['avoid', 'caution', 'no_obvious_risk', 'unavailable'];
  if (!recommendations.includes(value.recommendation)) return undefined;

  return {
    status: value.status,
    riskScore: Number.isInteger(value.riskScore) && value.riskScore >= 0 && value.riskScore <= 100
      ? value.riskScore
      : null,
    recommendation: value.recommendation,
    reason: typeof value.reason === 'string' ? value.reason : '',
  };
}
