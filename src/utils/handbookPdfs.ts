import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import type { Language } from '@/i18n/translations';

type PdfAssetContext = {
  (key: string): number;
  keys: () => string[];
};

export type HandbookPdf = { id: string; title: string; language: Language };

const pdfAssets = (require as typeof require & {
  context: (directory: string, recursive: boolean, filter: RegExp) => PdfAssetContext;
}).context('../../assets/handbooks', true, /^\.\/(en|hi|pa)\/[\w-]+\.pdf$/i);
const pdfAssetKeys = new Set(pdfAssets.keys());

export function listHandbookPdfs(language: Language): HandbookPdf[] {
  return [...pdfAssetKeys].flatMap((key) => {
    const match = key.match(/^\.\/(en|hi|pa)\/([\w-]+)\.pdf$/i);
    if (!match || match[1].toLowerCase() !== language) return [];

    const id = match[2].replace(/[_-]?\d{8}$/, '');
    const title = id
      .replace(/[-_]+/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
      .replace(/^CERT In\b/, 'CERT-In');
    return [{ id: match[2], title, language: match[1].toLowerCase() as Language }];
  }).sort((first, second) => first.title.localeCompare(second.title));
}

function getPdfModule(handbookId: string, language: Language): number | undefined {
  const key = `./${language}/${handbookId}.pdf`;
  return pdfAssetKeys.has(key) ? pdfAssets(key) : undefined;
}

export function hasHandbookPdf(handbookId: string, language: Language): boolean {
  return getPdfModule(handbookId, language) !== undefined;
}

async function getLocalPdfUri(handbookId: string, language: Language): Promise<string> {
  const moduleId = getPdfModule(handbookId, language);
  if (moduleId === undefined) throw new Error('PDF_NOT_FOUND');

  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error('PDF_UNAVAILABLE');
  return asset.localUri;
}

export async function previewHandbookPdf(handbookId: string, language: Language): Promise<void> {
  const localUri = await getLocalPdfUri(handbookId, language);

  if (Platform.OS === 'android') {
    const contentUri = await FileSystem.getContentUriAsync(localUri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      type: 'application/pdf',
      flags: 1,
    });
    return;
  }

  if (Platform.OS === 'web') {
    await Linking.openURL(localUri);
    return;
  }

  await Sharing.shareAsync(localUri, { mimeType: 'application/pdf' });
}

export async function downloadHandbookPdf(handbookId: string, language: Language): Promise<string> {
  const localUri = await getLocalPdfUri(handbookId, language);
  if (!FileSystem.documentDirectory) throw new Error('PDF_STORAGE_UNAVAILABLE');

  const directory = `${FileSystem.documentDirectory}handbooks/${language}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const destination = `${directory}${handbookId}.pdf`;
  await FileSystem.deleteAsync(destination, { idempotent: true });
  await FileSystem.copyAsync({ from: localUri, to: destination });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destination, {
      mimeType: 'application/pdf',
      dialogTitle: 'Save handbook PDF',
    });
  }

  return destination;
}