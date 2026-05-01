const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const projectNodeModules = path.resolve(projectRoot, 'node_modules');
const pakiShipProjectRoot = path.resolve(
  __dirname,
  '../../pakiship-fe/pakiship_mobile_fe-main',
);

const config = getDefaultConfig(projectRoot);

config.watchFolders = [pakiShipProjectRoot];
config.resolver.nodeModulesPaths = [
  projectNodeModules,
  path.resolve(pakiShipProjectRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  '@pakiship-app': pakiShipProjectRoot,
  react: path.resolve(projectNodeModules, 'react'),
  'react-dom': path.resolve(projectNodeModules, 'react-dom'),
  'react-native': path.resolve(projectNodeModules, 'react-native'),
  'react-native-safe-area-context': path.resolve(projectNodeModules, 'react-native-safe-area-context'),
  'react-native-screens': path.resolve(projectNodeModules, 'react-native-screens'),
  '@react-navigation/native': path.resolve(projectNodeModules, '@react-navigation/native'),
  '@react-navigation/native-stack': path.resolve(projectNodeModules, '@react-navigation/native-stack'),
};
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
