# PakiSHIP Operator

React Native mobile app for PakiSHIP hub operators. Built with Expo + TypeScript.

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

---

## Step-by-Step Setup

**1. Clone the repository**
```bash
git clone https://github.com/kyliesophiavillanueva3-eng/PakiSHIP-Operator.git
cd PakiSHIP-Operator
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

Mac/Linux:
```bash
cp .env.example .env
```

Then open `.env` and fill in the values:
```
RN_PUBLIC_APP_NAME=PakiSHIP Operator
RN_PUBLIC_APP_ENV=development
RN_PUBLIC_API_BASE_URL=your_api_url_here
```

**4. Start the development server**
```bash
npm start
```

**5. Open in Expo Go**

- A QR code will appear in your terminal
- Open the **Expo Go** app on your phone
- Scan the QR code
- The app will load on your device

> Make sure your phone and computer are on the **same Wi-Fi network**.

---

## Troubleshooting

- If the QR code doesn't work, try pressing `w` to switch to tunnel mode in the terminal
- If dependencies fail, delete `node_modules` and run `npm install` again
- If the app crashes on load, make sure your `.env` values are filled in correctly
