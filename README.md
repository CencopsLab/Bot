# CyberRakshak (Chandigarh Police) — React Native / Expo App

A citizen-facing cyber-safety companion app: AI chat assistance, a URL/APK
safety scanner, a nearby cyber-police-station locator, quick links to
official reporting portals, and offline CERT-In handbooks.

The repository contains the React Native app and a Node.js backend. The app
never calls Groq or scan providers directly; Chat and Scanner call the local
backend in `backend/`.

```
POST {API_BASE_URL}/api/chat   { message, session_id } -> { reply }
POST {API_BASE_URL}/api/scan   JSON { url }  OR  multipart file upload
```

## 1. Prerequisites

- Node.js 18 LTS or newer
- Android Studio installed, with an Android Virtual Device (emulator) created
  and an Android SDK configured (Android Studio > Device Manager)
- Java 17 (bundled with recent Android Studio)
- (Optional, but recommended) the Expo Go app is NOT required for the
  emulator — this project runs as a normal Expo dev build.

Check your Android emulator works on its own first: open Android Studio →
Device Manager → start a virtual device → confirm it boots.

## 2. Install dependencies

```bash
cd CyberRakshak
npm install
```

## 3. Point the app at your backend

```bash
cp .env.example .env
```

Edit `.env`:

```
API_BASE_URL=http://10.0.2.2:8000
```

## 4. Start the backend

```bash
cd backend
npm install
cp .env.example .env
```

Set `GROQ_API_KEY` and `GROQ_MODEL` in `backend/.env`, then start the API:

```bash
npm run dev
```

The chat uses a strict cyber-safety system prompt, a short bounded session
history, and a low token budget. URL, file, email, SMS, and mobile checks are
currently preliminary deterministic checks only; full reputation and malware
analysis can be added behind the same `/api/scan` contract later.

`10.0.2.2` is the special address the Android emulator uses to reach
`localhost` on your development machine — use it if your backend runs
locally on your laptop. If your backend is deployed somewhere reachable
(e.g. a cloud URL), put that URL here instead.

## 5. Run it in the Android emulator

Start your Android emulator first (via Android Studio's Device Manager, or
`emulator -avd <your_avd_name>` from the command line), then:

```bash
npx expo start --android
```

This builds and installs a development client onto the running emulator
and launches the app automatically. Subsequent runs are fast thanks to
Metro's fast refresh — just keep `npx expo start` running and edit code.

If you'd rather use the interactive Metro menu:

```bash
npx expo start
```

then press `a` once the QR/menu screen appears, with the emulator running.

## 6. Project structure

```
CyberRakshak/
├── App.tsx                     # App entry: providers + navigation
├── app.config.js               # Expo app config (name, icons, permissions, extra.apiBaseUrl)
├── package.json
├── .env.example                # Copy to .env — API_BASE_URL lives here
├── assets/                     # Icon, splash, adaptive icon (placeholder Chandigarh Police emblem)
├── backend/                    # Node.js chat + preliminary scan API
└── src/
    ├── api/                    # <- swap backend base URL / headers / auth here only
    │   ├── client.ts           # axios instance + centralized error handling
    │   ├── chatApi.ts          # POST /api/chat
    │   └── scanApi.ts          # POST /api/scan (URL + multipart file)
    ├── components/             # Reusable UI: Card, EmergencyButton, ChatBubble, ResultCard, Disclaimer...
    ├── config/env.ts           # Reads API_BASE_URL from app config
    ├── context/                # ChatHistoryProvider (AsyncStorage-backed chat history + session id)
    ├── data/                   # Static content: service links, station directory, CERT-In handbooks
    ├── navigation/             # Bottom tabs (Home/Chat/Scan/Help/More) + More stack
    ├── screens/                # One file per screen
    ├── theme/                  # Color tokens (navy/amber/teal) + typography scale
    ├── types/                  # Shared TypeScript types
    └── utils/                  # URL validation, AsyncStorage helpers
```

## 7. Notes on specific features

- **Emergency call button**: uses `Linking.openURL('tel:1930')`. On the
  Android emulator this opens the emulator's Phone app (it won't actually
  dial anywhere), so it's safe to test.
- **Locator map**: uses OpenStreetMap tiles through Leaflet in a WebView, so it
  does not require a Google Maps API key. Station direction buttons open the
  device's Google Maps directions URL when the user requests navigation.
- **Scanner file picker**: uses `expo-document-picker`, restricted to APKs
  and common file types, with an upload-progress indicator on submit.
- **Integrated services**: open via `expo-web-browser` (Chrome Custom
  Tabs / SFSafariViewController) rather than leaving the app.
- **CERT-In handbooks**: fully static content bundled in
  `src/data/handbooks.ts` — no network call, works offline.
- **Chat history**: stored locally with `@react-native-async-storage/async-storage`;
  nothing is persisted server-side by this app.
- **Dark mode**: driven by `useColorScheme()` throughout; no manual toggle needed.
- **Language toggle**: UI-functional switch in More → Language, but only
  English strings exist in v1 — Hindi/Punjabi are visual placeholders as
  specced.
- **Auth token placeholder**: see the commented-out interceptor in
  `src/api/client.ts` for where to add an API key/bearer token later.

## 8. Deploy the backend to Render

The root `render.yaml` is ready for a Render Blueprint deployment. In Render,
create a new Blueprint from this repository, then set the secret
`GROQ_API_KEY` in the backend service environment. Render supplies `PORT`
automatically and the service health check is `/health`.

After deployment, copy the service URL, for example:

```
https://CyberRakshak-backend.onrender.com
```

## 9. Build Android artifacts

This project is set up for local development via Expo. When you're ready
to produce a real installable `.apk`/`.aab`, the standard path is EAS
Build:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

On Windows PowerShell, set the build-time variable first:

```powershell
eas build --platform android --profile production
```

The `development`, `preview`, and `production` profiles currently point to the
hosted Render backend. Production creates an Android App Bundle (`.aab`), while
preview creates an installable APK. Profile `env` values are supplied during
the build and do not appear in `eas env:list`.

Use `eas build --platform android --profile production` for the Play Store
bundle, or `eas build --platform android --profile preview` for a directly
installable APK. Both artifacts contain only the public backend URL; the Groq
key remains on the backend and must never be added to the mobile app.
