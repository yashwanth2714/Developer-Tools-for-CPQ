const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');
const outputPath = `build/developer-tools-for-cpq-${version}.vsix`;

const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.vsix'))
    .forEach(file => fs.unlinkSync(path.join(buildDir, file)));

execSync(`vsce package --out ${outputPath}`, { stdio: 'inherit' });
