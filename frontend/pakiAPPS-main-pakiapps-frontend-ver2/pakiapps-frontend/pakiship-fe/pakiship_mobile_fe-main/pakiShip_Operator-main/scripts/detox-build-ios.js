if (process.platform !== 'darwin') {
  console.error('iOS Detox builds require macOS and Xcode.');
  process.exit(1);
}

// Full iOS build script — see template-repo-mobile-single/scripts/detox-build-ios.js for complete implementation
console.log('iOS Detox build — run on macOS with Xcode installed.');
process.exit(0);
