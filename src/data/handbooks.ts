import type { Handbook } from '@/types';

// Static, offline-readable content — no network dependency for this screen.
export const HANDBOOKS: Handbook[] = [
  {
    id: 'phishing',
    title: 'Recognizing Phishing Messages',
    summary: 'How to spot fake bank, KYC, and delivery SMS/emails.',
    content:
      'Phishing messages often create urgency ("your account will be blocked"), ' +
      'contain misspelled links, or ask you to share OTPs. Banks and government ' +
      'services never ask for your OTP or full card number over call, SMS, or email. ' +
      'Verify by visiting the official website directly instead of clicking links. ' +
      'If you have shared an OTP or made a payment by mistake, call 1930 immediately.',
  },
  {
    id: 'sim-swap',
    title: 'SIM Swap & Mobile Fraud',
    summary: 'What to do if your SIM suddenly stops working.',
    content:
      'A sudden, unexplained loss of mobile network can indicate SIM swap fraud. ' +
      'Contact your telecom operator immediately to confirm, and check TAFCOP for any ' +
      'connections you did not request. If any financial fraud has occurred, report it ' +
      'at cybercrime.gov.in or call 1930 within the first 24 hours for the best chance ' +
      'of freezing fraudulent transactions.',
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering & Fake Calls',
    summary: 'Tactics used by scammers pretending to be officials.',
    content:
      'Callers may impersonate bank staff, police, or courier services and create fear ' +
      '(e.g. "your parcel contains illegal items", "your account is under investigation"). ' +
      'Genuine agencies do not ask for money transfers, OTPs, or remote access to your ' +
      'phone/laptop to "verify" you. Hang up, and independently verify using an official ' +
      'number found on the organization\'s website.',
  },
  {
    id: 'safe-apps',
    title: 'Installing Apps Safely',
    summary: 'Reducing your risk from malicious APKs.',
    content:
      'Install apps only from the Google Play Store where possible. Avoid sideloading ' +
      'APKs shared via WhatsApp or SMS links, even if the sender appears to be a known ' +
      'contact. Use the Scanner tab in this app to check a suspicious file or link before ' +
      'opening it, and remember a "safe" scan result is one signal, not a guarantee.',
  },
];
