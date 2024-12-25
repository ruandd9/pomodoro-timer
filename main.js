const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
    const iconPath = path.join(__dirname, 'icon.png');

    // Destruir tray existente se houver
    if (tray) {
        tray.destroy();
        tray = null;
    }

    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false,
        resizable: false,
        icon: iconPath,
        skipTaskbar: true // Não mostrar na barra de tarefas
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('close', function (event) {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    // Criar o ícone da bandeja
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Mostrar App', 
            click: () => mainWindow.show() 
        },
        { 
            label: 'Pausar Timer', 
            click: () => mainWindow.webContents.send('pause-timer') 
        },
        { 
            label: 'Reiniciar Timer', 
            click: () => mainWindow.webContents.send('reset-timer') 
        },
        { type: 'separator' },
        { 
            label: 'Sair', 
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Pomodoro Timer');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

app.on('ready', () => {
    createWindow();
    // Esconder o ícone do dock no macOS
    if (process.platform === 'darwin') {
        app.dock.hide();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.hide();
});

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.hide();
});

// Novo evento para testar notificações
ipcMain.on('test-notification', () => {
    if (mainWindow) {
        mainWindow.webContents.send('show-test-notification');
    }
});
