/**
 * clear-tunnel.js
 *
 * REMOVES the Cloudflare tunnel lines from .env entirely so that
 * `npm run start` always launches in clean Local/LAN mode.
 *
 * IMPORTANT: We DELETE these lines (not blank them out).
 * Setting REACT_NATIVE_PACKAGER_HOSTNAME="" causes Expo to use
 * an empty string as the Metro hostname and BREAKS the bundler.
 * Removing the lines entirely lets Expo auto-discover the local IP.
 *
 * Also used standalone as `npm run clear`.
 */
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');

const TUNNEL_KEYS = [
  'EXPO_PACKAGER_PROXY_URL',
  'REACT_NATIVE_PACKAGER_HOSTNAME',
];

function clearTunnelEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    console.log('ℹ️  No .env file found — nothing to clear.');
    return;
  }

  let lines = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
  const originalLength = lines.length;

  // Remove any line that starts with one of the tunnel keys
  lines = lines.filter((line) => {
    return !TUNNEL_KEYS.some((key) => line.startsWith(`${key}=`));
  });

  if (lines.length !== originalLength) {
    fs.writeFileSync(ENV_PATH, lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n', 'utf8');
    console.log('🧹 Removed stale tunnel settings from .env. Running in Local/LAN mode.');
  } else {
    console.log('✅ No stale tunnel settings found in .env.');
  }
}

clearTunnelEnv();
