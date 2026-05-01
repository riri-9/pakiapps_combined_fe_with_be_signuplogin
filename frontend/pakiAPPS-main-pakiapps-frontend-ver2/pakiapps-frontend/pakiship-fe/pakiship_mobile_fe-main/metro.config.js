const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const pakiAppsLauncherRoot = path.resolve(__dirname, '../../pakipark-fe/pakipark-fe');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [pakiAppsLauncherRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(pakiAppsLauncherRoot, 'node_modules'),
];

module.exports = config;
