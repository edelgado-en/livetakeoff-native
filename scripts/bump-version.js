const fs = require('fs');
const path = require('path');

const appJsonPath = path.resolve(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));

const newVersionCode = (appJson.expo.android?.versionCode || 1) + 1;
const newBuildNumber = (parseInt(appJson.expo.ios?.buildNumber || '1', 10) + 1).toString();

// Optional: bump minor version
const [major, minor, patch] = appJson.expo.version.split('.').map(Number);
const newVersion = `${major}.${minor + 1}.0`; // You can adjust this logic

appJson.expo.version = newVersion;
appJson.expo.android.versionCode = newVersionCode;
appJson.expo.ios.buildNumber = newBuildNumber;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`✅ Bumped to version ${newVersion} (iOS: ${newBuildNumber}, Android: ${newVersionCode})`);
