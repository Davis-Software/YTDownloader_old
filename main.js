const { app, BrowserWindow } = require("electron")
const { autoUpdater } = require('electron-updater')
const fs = require("fs")

const config = require("./back/config")

require("./back/downloader")

if(config.dev_mode){
    app.setAppUserModelId(process.execPath)
}
app.allowRendererProcessReuse = true

let win


let cache = app.getPath("userData")
if(!fs.existsSync(cache + "/tools")) fs.mkdirSync(cache + "/tools")
if(process.platform === "win32"){
    fs.copyFileSync("./tools/ffmpeg.exe", cache + "/tools/ap.exe")
    fs.copyFileSync("./tools/ffmpeg.exe", cache + "/tools/ffmpeg.exe")
}else{
    fs.copyFileSync("./tools/ffmpeg", cache + "/tools/ap")
    fs.copyFileSync("./tools/ffmpeg", cache + "/tools/ffmpeg")
}



async function startMain(){
    if(app.requestSingleInstanceLock()){
        MainWindow()
        if(!config.dev_mode) {
            autoUpdater.checkForUpdates().then()
        }
    }
}

function MainWindow () {
    win = new BrowserWindow({
        width: 1200,
        height: 720,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webviewTag: false,
        },
        darkTheme: true,
        frame: false
    })

    win.on('focus', () => win.flashFrame(false))

    win.setIcon(config.icon_path)
    win.loadFile("./templates/index.html").then()
}

app.whenReady().then(startMain)

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        MainWindow()
    }
})


// Single Instance lock
function openedByUrl(url) {
    if (url) {
        win.webContents.send('openedByUrl', url)
    }
}
if (app.requestSingleInstanceLock()) {
    app.on('second-instance', (e, argv) => {
        if (config.platform === 'win32') {
            openedByUrl(argv.find((arg) => arg.startsWith('swc_desktopapp:')))
        }
        if (win) {
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
        }
    }
)}

if (!app.isDefaultProtocolClient('swc_desktopapp')) {
    app.setAsDefaultProtocolClient('swc_desktopapp');
}


//-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
const sendStatusToWindow = (text) => {
    if (win) {
        win.webContents.send('updatemessage', text);
    }
};

autoUpdater.on('update-available', info => {
    win.loadFile('./templates/update.html').then(()=>{
        autoUpdater.downloadUpdate().then()
        if (win) {
            win.webContents.send('info', info)
        }
    })

});
autoUpdater.on('error', err => {
    sendStatusToWindow(["error", `Error in auto-updater: ${err.toString()}`])
})
autoUpdater.on('download-progress', progressObj => {
    sendStatusToWindow(
        ["downloading", {"speed": progressObj.bytesPerSecond, "progress": progressObj.percent, "transferred": progressObj.transferred, "total": progressObj.total}]
    );
});

autoUpdater.on('update-downloaded', info => {
    autoUpdater.quitAndInstall();
});
