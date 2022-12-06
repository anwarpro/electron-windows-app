const {app, BrowserWindow} = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let downstreamInstance;
const downstreamElectron = require('downstream-electron');

app.allowRendererProcessReuse = true;

const createWindow = () => {

    // eslint-disable-next-line no-process-env
    const appDir = `${path.dirname(process.mainModule.filename)}/`;
    // head request parameter test
    const useHeadRequest = true;

    // let useHeadRequest = false;
    downstreamInstance = downstreamElectron.init({
        appDir,
        numberOfManifestsInParallel: 2,
        useHeadRequests: useHeadRequest,
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 728,
        webPreferences: {
            plugins: true,
            contextIsolation: false,
            nodeIntegration: true,
            // NOTE: is disabled by default since Electron 9
            enableRemoteModule: true,
            // NOTE: !WARNING! use with caution it allows app to download content
            //                 from any URL
            webSecurity: false
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

function onWillQuit() {
    downstreamInstance.stop();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('will-quit', onWillQuit);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log('window-all-closed');
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('widevine-ready', (version, lastVersion) => {
    if (null !== lastVersion) {
        console.log('Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!');
    } else {
        console.log('Widevine ' + version + ' is ready to be used!');
    }
});

app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
    console.log('Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!');
});

app.on('widevine-error', (error) => {
    console.log('Widevine installation encounterted an error: ' + error);
    process.exit(1)
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
