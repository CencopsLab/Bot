import { apiClient, toApiError } from './client';
import type { ScanResult } from '@/types';

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
    verdictRaw === 'safe' || verdictRaw === 'suspicious' || verdictRaw === 'malicious'
      ? verdictRaw
      : 'unknown';

  return {
    verdict,
    summary: data?.summary ?? data?.message ?? 'Scan complete.',
    detectionRatio: data?.detection_ratio ?? data?.detectionRatio,
    threatName: data?.threat_name ?? data?.threatName,
    scannedTarget: target,
    scannedAt: Date.now(),
  };
}
