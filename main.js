const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const crypto = require('crypto');
const ElectronStore = require('electron-store');

let tray = null;
let configWindow;

let iconPath = path.join(__dirname, 'icon.png');

function openConfigWindow() {
    configWindow = new BrowserWindow({
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    configWindow.loadFile('config.html');
    configWindow.on('closed', () => {
        configWindow = null;
        // reload config after the window is closed
        if (store.get('url') && store.get('username') && store.get('password')) {
            loadConfig();
        }
    });
}

const encryptionKey = crypto.randomBytes(32); // Must be 32 bytes
const iv = crypto.randomBytes(16); // Must be 16 bytes

function saveConfig(url, username, password) {
    const store = new ElectronStore();
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

    let encryptedUrl = cipher.update(url, 'utf8', 'hex') + cipher.final('hex');
    let encryptedUsername = cipher.update(username, 'utf8', 'hex') + cipher.final('hex');
    let encryptedPassword = cipher.update(password, 'utf8', 'hex') + cipher.final('hex');

    store.set('url', encryptedUrl);
    store.set('username', encryptedUsername);
    store.set('password', encryptedPassword);
}

function loadConfig() {
    const store = new ElectronStore();
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);

    let url = decipher.update(store.get('url'), 'hex', 'utf8') + decipher.final('utf8');
    let username = decipher.update(store.get('username'), 'hex', 'utf8') + decipher.final('utf8');
    let password = decipher.update(store.get('password'), 'hex', 'utf8') + decipher.final('utf8');

    mountWebDav(url, username, password);
}

function mountWebDav(url, username, password) {
    exec(`net use Z: ${url} /User:${username} ${password}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

app.whenReady().then(() => {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: '配置', click: openConfigWindow },
        { label: '退出', click: () => { app.quit() } }
    ])
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu)

    // check if config exists, if not - open config window
    const store = new ElectronStore();
    if (!(store.get('url') && store.get('username') && store.get('password'))) {
        openConfigWindow();
    } else {
        loadConfig();
    }
});