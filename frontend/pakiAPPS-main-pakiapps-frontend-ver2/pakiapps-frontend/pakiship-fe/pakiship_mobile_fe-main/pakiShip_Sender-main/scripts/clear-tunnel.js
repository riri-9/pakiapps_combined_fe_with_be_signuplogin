const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');

function clearTunnel() {
    if (!fs.existsSync(ENV_PATH)) {
        return;
    }

    let envContent = fs.readFileSync(ENV_PATH, 'utf8');

    const proxyRegex = /^EXPO_PACKAGER_PROXY_URL=.*$/gm;
    const hostnameRegex = /^REACT_NATIVE_PACKAGER_HOSTNAME=.*$/gm;

    if (proxyRegex.test(envContent) || hostnameRegex.test(envContent)) {
        envContent = envContent.replace(proxyRegex, '');
        envContent = envContent.replace(hostnameRegex, '');
        envContent = envContent.replace(/\n\s*\n/g, '\n').trim() + '\n';
        fs.writeFileSync(ENV_PATH, envContent, 'utf8');
        console.log('🧹 Cleared tunnel settings from .env');
    }
}

clearTunnel();
