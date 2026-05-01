# PakiAPPS (Customer Mobile App)

Welcome to the React Native (Expo) mobile application for PakiAPPS.
The project is built using **Expo SDK 54** and includes a high-fidelity booking flow.

---

## 🚀 First-Time Setup

Follow these steps to ensure the app starts correctly, especially if you encounter styling or dependency errors.

### 1. Install Dependencies

Because your system might block PowerShell scripts, prefix `npm` and `npx` commands with `cmd /c`:

```bash
cmd /c "npm install --legacy-peer-deps"
```

> We use `--legacy-peer-deps` to handle specific version requirements for Expo SDK 54.

### 2. Choose Your Development Mode

We provide multiple ways to run the app depending on your network environment:

| Command | Connectivity | Note |
|---|---|---|
| `npm run start` | Local / LAN | Best for emulators or same Wi-Fi. *(Automatically clears tunnel settings)* |
| `npm run dev` | Cloudflare | Automated Tunnel. Works across different networks. No account needed. |
| `npm run ngrok` | Ngrok (Native) | Built-in Expo tunnel. Requires an Ngrok account & auth token. |
| `npm run clear` | Cleanup | Manually removes stale tunnel settings from `.env`. |

### 3. Scan the QR Code

Once the QR code appears in your terminal:

- **iOS**: Scan with your **Camera app**.
- **Android**: Open the **Expo Go** app and use the built-in scanner.

---

## 🛠️ Troubleshooting

### Cloudflare "Error 530"

If you see an **HTTP 530** on your phone when using `npm run dev`:

- It usually translates to *"Metro is not ready yet."*
- **The Fix:** Wait 5 seconds and refresh the app on your phone.
- If it persists, restart the terminal and run `npm run dev` again.

### Ngrok "Took Too Long to Connect"

If you see this error when using `npm run ngrok`:

- You may be missing an auth token. Run: `npx ngrok config add-authtoken YOUR_TOKEN`.
- Your network may be blocking the Ngrok protocol. Switch to `npm run dev` (Cloudflare) instead.

### "Use process(css).then(cb)" Error

If you see a red screen about CSS, the Babel cache is stale:

1. Stop the server (`Ctrl + C`).
2. Restart with: `npx expo start -c`.

### Missing Configuration (Babel / Tailwind)

If styles or path aliases (e.g., `@/features/...`) aren't working, ensure `babel.config.js` and `tailwind.config.js` exist in the root directory.

---

## 🗂️ Project Structure

```
src/
├── app/                  # Top-level app composition (App.tsx)
├── config/               # Runtime config & environment mapping
├── features/             # Feature modules (screens, components, hooks)
│   └── auth/             # Authentication feature
│       └── screens/      # LoginScreen.tsx
├── navigation/           # Route definitions (RootNavigator.tsx)
├── theme/                # Colors, spacing, typography tokens
└── utils/                # Shared utility functions

tests/
├── unit/                 # Jest unit tests (*.test.ts / *.test.tsx)
└── e2e/                  # Detox E2E tests (*.e2e.ts)
```

---

## 🧪 Running Tests

```bash
# Run unit tests with coverage
npm run test

# Lint check (0 warnings allowed)
npm run lint

# Run both (pre-PR check)
npm run verify
```

---

## 📦 CI/CD

This project uses a GitHub Actions reusable mobile pipeline.

Before pushing, set the repository variable:
```
MOBILE_SINGLE_SYSTEMS_JSON = { "name": "PakiSHIP-Mobile", "dir": ".", "mobile_stack": "react-native" }
```

Pipeline triggers on push/PR to `test`, `uat`, and `main` branches.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Navigation | React Navigation (`RootNavigator`) |
| Styling | NativeWind (TailwindCSS for React Native) |
| Tunneling | Cloudflare (default), Ngrok (optional) |
| Icons | `lucide-react-native` |
| Testing | Jest (unit) + Detox (E2E) |
| Figma | [Original Concepts](https://www.figma.com/design/E4Y9z4rrXBx9JwQDgUONIt/PakiAPPS--Copy-) |