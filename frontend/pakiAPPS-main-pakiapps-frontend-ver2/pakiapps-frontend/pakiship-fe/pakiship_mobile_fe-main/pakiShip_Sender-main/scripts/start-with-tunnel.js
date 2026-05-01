const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');
const BIN_DIR = path.join(__dirname, '../node_modules/.bin');
const isWindows = process.platform === 'win32';

function resolveLocalBin(command) {
    const executable = isWindows ? `${command}.cmd` : command;
    return path.join(BIN_DIR, executable);
}

function runSpawn(command, args, options = {}) {
    const localBin = resolveLocalBin(command);
    const useLocalBin = fs.existsSync(localBin);
    const executable = useLocalBin ? localBin : (isWindows ? 'npx.cmd' : 'npx');
    const finalArgs = useLocalBin ? args : ['-y', command, ...args];

    if (isWindows) {
        const escapedArgs = finalArgs.map(arg => `"${String(arg).replace(/"/g, '\\"')}"`);
        const commandLine = [`"${executable}"`, ...escapedArgs].join(' ');
        return spawn(process.env.comspec || 'cmd.exe', ['/d', '/s', '/c', commandLine], {
            shell: false,
            windowsHide: true,
            ...options,
        });
    }

    return spawn(executable, finalArgs, { shell: false, windowsHide: true, ...options });
}

async function updateEnv(url) {
    console.log(`\n🚀 Capturing Cloudflare URL: ${url}`);

    let envContent = '';
    if (fs.existsSync(ENV_PATH)) {
        envContent = fs.readFileSync(ENV_PATH, 'utf8');
    }

    const proxyRegex = /^EXPO_PACKAGER_PROXY_URL=.*$/m;
    const hostnameRegex = /^REACT_NATIVE_PACKAGER_HOSTNAME=.*$/m;

    if (proxyRegex.test(envContent)) {
        envContent = envContent.replace(proxyRegex, `EXPO_PACKAGER_PROXY_URL="${url}"`);
    } else {
        envContent += `\nEXPO_PACKAGER_PROXY_URL="${url}"`;
    }

    if (hostnameRegex.test(envContent)) {
        envContent = envContent.replace(hostnameRegex, `REACT_NATIVE_PACKAGER_HOSTNAME="${url.replace('https://', '')}"`);
    } else {
        envContent += `\nREACT_NATIVE_PACKAGER_HOSTNAME="${url.replace('https://', '')}"`;
    }

    fs.writeFileSync(ENV_PATH, envContent.trim() + '\n', 'utf8');
    console.log('✅ Updated .env with new tunnel URL.');
}

async function start() {
    console.log('🧹 Clearing port 8081...');
    const killPort = runSpawn('kill-port', ['8081']);
    await new Promise(resolve => killPort.on('exit', resolve));

    console.log('🌐 Starting Cloudflare Tunnel (Protocol: http2)...');
    const tunnel = runSpawn('cloudflared', [
        'tunnel',
        '--url', 'http://127.0.0.1:8081',
        '--http-host-header', 'localhost',
        '--protocol', 'http2',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let urlFound = false;

    tunnel.stderr.on('data', async (data) => {
        const output = data.toString();
        const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (urlMatch && !urlFound) {
            urlFound = true;
            const url = urlMatch[0];
            await updateEnv(url);

            console.log('📲 Starting Expo with the new tunnel...');
            const expo = runSpawn('expo', ['start'], { stdio: 'inherit' });
            expo.on('exit', (code) => {
                console.log(`Expo exited with code ${code}`);
                process.exit(code);
            });
        }
    });

    tunnel.on('exit', (code) => {
        if (!urlFound) {
            console.error(`Tunnel failed to start (exit code ${code})`);
            process.exit(code || 1);
        }
    });
}

start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
