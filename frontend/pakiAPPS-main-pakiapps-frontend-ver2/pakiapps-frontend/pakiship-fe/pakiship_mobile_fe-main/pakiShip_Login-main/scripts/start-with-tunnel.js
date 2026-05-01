const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');
const isWindows = process.platform === 'win32';

/**
 * A helper function to spawn commands in a platform-agnostic way.
 */
function runSpawn(command, args, options = {}) {
    if (isWindows) {
        // On Windows, npx must be called via cmd /c
        return spawn('cmd', ['/c', command, ...args], { shell: true, ...options });
    } else {
        // On Unix, call the command directly
        return spawn(command, args, { shell: true, ...options });
    }
}

async function updateEnv(url) {
    console.log(`\n🚀 Capturing Cloudflare URL: ${url}`);
    
    let envContent = '';
    if (fs.existsSync(ENV_PATH)) {
        envContent = fs.readFileSync(ENV_PATH, 'utf8');
    }

    // Update EXPO_PACKAGER_PROXY_URL and REACT_NATIVE_PACKAGER_HOSTNAME
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
    const killPort = runSpawn('npx', ['-y', 'kill-port', '8081']);
    await new Promise(resolve => killPort.on('exit', resolve));

    console.log('🌐 Starting Cloudflare Tunnel...');
    const tunnel = runSpawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', 'http://localhost:8081'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let urlFound = false;

    // Cloudflare logs the URL to stderr
    tunnel.stderr.on('data', async (data) => {
        const output = data.toString();
        // console.log(output);

        const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (urlMatch && !urlFound) {
            urlFound = true;
            const url = urlMatch[0];
            await updateEnv(url);
            
            console.log('📲 Starting Expo with the new tunnel...');
            const expo = runSpawn('npx', ['expo', 'start'], { 
                stdio: 'inherit'
            });
            
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
