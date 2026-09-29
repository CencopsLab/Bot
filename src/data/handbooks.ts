import type { Handbook } from '@/types';

// Static, offline-readable content — no network dependency for this screen.
export const HANDBOOKS: Handbook[] = [
  {
    id: 'phishing',
    title: 'Recognizing Phishing Messages',
    summary: 'How to spot fake bank, KYC, and delivery SMS/emails.',
    content:
      'Phishing is when a scammer sends a fake message that looks like it is from your ' +
      'bank, a government office, or a delivery company. The goal is to trick you into ' +
      'clicking a link or sharing private details like your OTP, PIN, or password.\n\n' +
      'Warning signs:\n' +
      '• Urgent or scary language, like "Your account will be blocked today" or ' +
      '"Update your KYC now or lose access".\n' +
      '• Links that look almost right but have spelling mistakes or odd endings ' +
      '(for example, "sbi-secure-login.xyz" instead of the real bank website).\n' +
      '• Requests for your OTP, PIN, CVV, or full card number.\n' +
      '• Messages from unknown numbers offering prizes, refunds, or free gifts.\n\n' +
      'Remember: banks and government services NEVER ask for your OTP or full card ' +
      'number over a call, SMS, or email.\n\n' +
      'What to do:\n' +
      '• Don\'t click links in unexpected messages. Type the official website address ' +
      'yourself or use the official app.\n' +
      '• Never share an OTP with anyone, even if they say they are from your bank.\n' +
      '• Take a moment before reacting. Scammers rely on you panicking.\n' +
      '• Check suspicious messages with the Scanner tab in this app.\n\n' +
      'Shared an OTP or paid by mistake? Call 1930 immediately. The sooner you report, ' +
      'the better the chance of stopping the payment.',
  },
  {
    id: 'sim-swap',
    title: 'SIM Swap & Mobile Fraud',
    summary: 'What to do if your SIM suddenly stops working.',
    content:
      'In a SIM swap scam, a fraudster tricks your mobile operator into issuing a new ' +
      'SIM with your phone number. Once they have it, they can receive your OTPs and ' +
      'bank alerts and may be able to empty your accounts.\n\n' +
      'Signs that something may be wrong:\n' +
      '• Your phone suddenly shows "No Service" or "Emergency calls only" for no clear reason.\n' +
      '• You stop receiving calls and SMS, but others nearby have normal signal.\n' +
      '• You get unexpected messages about SIM changes or password resets.\n' +
      '• Unknown callers ask for your SIM or ID details.\n\n' +
      'What to do (the first few hours matter most):\n' +
      '• Call your telecom operator from another phone to check if a new SIM was issued.\n' +
      '• Check the TAFCOP portal to see all mobile connections registered in your name, ' +
      'and report any you don\'t recognize.\n' +
      '• Contact your bank to temporarily freeze your accounts and cards.\n' +
      '• Never share your SIM number, Aadhaar copy, or ID details with unknown callers.\n\n' +
      'If money has been taken, report it at cybercrime.gov.in or call 1930 within 24 ' +
      'hours. Quick reporting gives the best chance of freezing fraudulent transactions.',
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering & Fake Calls',
    summary: 'Tactics used by scammers pretending to be officials.',
    content:
      'Social engineering means manipulating people, rather than hacking devices, to ' +
      'get money or information. Scammers often pretend to be bank staff, police, ' +
      'customs officers, or courier agents.\n\n' +
      'They usually follow the same pattern:\n' +
      '1. Scare you: "Your parcel has illegal items", "Your account is under ' +
      'investigation", or "A case has been filed against you".\n' +
      '2. Rush you: they demand you act now and stay on the line.\n' +
      '3. Isolate you: they tell you not to speak to family or friends.\n' +
      '4. Take from you: they ask for money transfers, OTPs, or remote access to your ' +
      'phone or laptop.\n\n' +
      'Real agencies do not work this way. No genuine officer will ask you to transfer ' +
      'money to "clear" your name or to install a screen-sharing app.\n\n' +
      'What to do:\n' +
      '• Hang up immediately. It is okay to be rude when your safety is at risk.\n' +
      '• Look up the organization\'s official number on its website and call back yourself.\n' +
      '• Never install apps like AnyDesk or TeamViewer at a caller\'s request.\n' +
      '• Talk to a family member or friend before making any payment under pressure.\n\n' +
      'Already fallen for it? Call 1930 or report at cybercrime.gov.in right away.',
  },
  {
    id: 'safe-apps',
    title: 'Installing Apps Safely',
    summary: 'Reducing your risk from malicious APKs.',
    content:
      'Fake or malicious apps can secretly read your messages, steal OTPs, record your ' +
      'screen, or take control of your phone. They often spread as APK files sent ' +
      'through WhatsApp, Telegram, or SMS links, sometimes disguised as bank apps, ' +
      'offers, or wedding invitations.\n\n' +
      'Safe habits:\n' +
      '• Install apps only from the Google Play Store.\n' +
      '• Avoid installing APK files from messages, even if they come from someone you ' +
      'know. Their account may have been hacked.\n' +
      '• Before installing, check the developer name, number of downloads, and recent reviews.\n' +
      '• Be careful with apps asking for permissions they don\'t need, like a flashlight ' +
      'app asking for access to your SMS or contacts.\n' +
      '• Keep "Install unknown apps" turned off in your phone settings.\n' +
      '• Keep your phone and apps updated for the latest security fixes.\n\n' +
      'Use the Scanner tab in this app to check a suspicious file or link before ' +
      'opening it. Remember, a "safe" scan result is one signal, not a guarantee.\n\n' +
      'Installed something suspicious? Turn on airplane mode, uninstall the app, change ' +
      'your banking passwords from another device, and call 1930 if money is at risk.',
  },
];
