// generate-latest-yml.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
//fox-quality-dashboard-1.1.26 Setup.exe
const version = require('./package.json').version;
const productName = require('./package.json').name || 'app';
const exeName = `${productName}-${version}-Setup.exe`; // Adjust if yours differs

const exePath = path.join(__dirname, 'out', 'make', 'squirrel.windows', 'x64', exeName);
const latestYmlPath = path.join(__dirname, 'out', 'make', 'squirrel.windows', 'x64', 'latest.yml');
const updatedYmlPath = path.join(__dirname, 'out', `${productName}-win32-x64`,'resources', 'app-update.yml');

if (!fs.existsSync(exePath)) {
  console.error('ERROR: .exe not found at', exePath);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(exePath);
const size = fileBuffer.length;
const sha512 = crypto.createHash('sha512').update(fileBuffer).digest('base64');

const latestYmlContent = `
version: ${version}
path: ${exeName}
sha512: ${sha512}
releaseDate: ${new Date().toISOString()}
files:
  - url: ${exeName}
    sha512: ${sha512}
    size: ${size}
`;
const updatedYmlContent = `
provider: github
owner: CloudCante
repo: Fox_app
`;

fs.writeFileSync(latestYmlPath, latestYmlContent.trim(), 'utf8');
fs.writeFileSync(updatedYmlPath, updatedYmlContent.trim(), 'utf8');

console.log(`✅ latest.yml written to ${latestYmlPath}`);
//console.log(`✅ app-update.yml written to ${updatedYmlPath}`);
