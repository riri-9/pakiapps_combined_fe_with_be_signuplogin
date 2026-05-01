# PakiAPPS (Customer Mobile App)

Welcome to the React Native (Expo) mobile application for PakiAPPS.
The project is built using Expo SDK 54 and includes a high-fidelity booking flow.

## 🚀 First-Time Setup

Follow these steps to ensure the app starts correctly, especially if you encounter styling or dependency errors.

### 1. Install Dependencies
Because your system might block PowerShell scripts, prefix `npm` and `npx` commands with `cmd /c`:
```bash
cmd /c "npm install --legacy-peer-deps"
```

### 2. Choose Your Development Mode

We provide multiple ways to run the app depending on your network environment:

| Command | Connectivity | Note |
| :--- | :--- | :--- |
| **`npm run start`** | **Local / LAN** | Best for emulators or same Wi-Fi. (Automatically clears tunnel settings) |
| **`npm run dev`** | **Cloudflare** | Automated Tunnel. Works across different networks. No account needed. |
| **`npm run ngrok`** | **Ngrok (Native)** | Built-in Expo tunnel. Requires an Ngrok account & auth token. |
| **`npm run clear`** | **Cleanup** | Manually removes stale tunnel settings from `.env`. |

---

## 🛠️ Troubleshooting

### Cloudflare "Error 530"
If you see an "HTTP 530" on your phone when using **`npm run dev`**:
1. It usually translates to "Metro is not ready yet."
2. **The Fix**: Wait 5 seconds and refresh the app on your phone.
3. If it persists, restart the terminal and run `npm run dev` again.

### Ngrok "Took Too Long to Connect"
If you see this error when using **`npm run ngrok`**:
1. You may be missing an auth token. Run: `npx ngrok config add-authtoken YOUR_TOKEN`.
2. Your network may be blocking the Ngrok protocol. Switch to **`npm run dev`** (Cloudflare) instead.

### "Use process(css).then(cb)" Error
If you see a red screen about CSS, the Babel cache is stale:
1. Stop the server (`Ctrl + C`).
2. Restart with: `npx expo start -c`.

---

## Tech Stack 🛠️
- **Framework:** React Native (`expo` SDK 54)
- **Navigation:** React Navigation (RootNavigator)
- **Styling:** NativeWind (TailwindCSS for React Native)
- **Tunneling:** Cloudflare (Automated) / Ngrok (Native)
- **Icons:** `lucide-react-native`
- **Figma Design:** [Original Concepts](https://www.figma.com/design/E4Y9z4rrXBx9JwQDgUONIt/PakiAPPS--Copy-)