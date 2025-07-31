const fs = require('fs');
const path = require('path');

const srcCommon = path.join(__dirname, '..', 'common');
const srcChrome = path.join(__dirname, '..', 'chrome');
const srcFirefox = path.join(__dirname, '..', 'firefox');
const distDir = path.join(__dirname, '..', 'dist');

async function cleanDist() {
    console.log('Cleaning dist directory...');
    await fs.promises.rm(distDir, {recursive: true, force: true});
    console.log('Dist directory cleaned.');
}

async function copyDir(src, dest) {
    await fs.promises.mkdir(dest, {recursive: true});
    const entries = await fs.promises.readdir(src, {withFileTypes: true});

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
}

async function buildExtension(browser) {
    const browserDistDir = path.join(distDir, browser, 'ZenNotes');
    const browserSrcDir = (browser === 'chrome') ? srcChrome : srcFirefox;

    console.log(`Building ${browser} extension...`);

    await fs.promises.mkdir(browserDistDir, {recursive: true});

    // 1. Copy common files
    await copyDir(srcCommon, browserDistDir);

    // 2. Copy browser-specific files
    await copyDir(browserSrcDir, browserDistDir);

    console.log(`${browser} extension built successfully.`);
}

async function main() {
    const targetBrowser = process.argv[2];

    await cleanDist();
    if (['chrome', 'firefox'].includes(targetBrowser)) {
        await buildExtension(targetBrowser);
    } else if (targetBrowser === 'all') {
        await buildExtension('chrome');
        await buildExtension('firefox');
    } else {
        console.error('Usage: node scripts/build.js [chrome|firefox|all]');
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});