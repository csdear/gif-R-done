const electron = require('electron');



const { app, BrowserWindow, Menu, ipcMain } = electron;


const path = require('path');
const url = require('url');

let mainWindow;
let addWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 1100, height: 850})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    mainWindow.on('closed', () => app.quit());
    //I think app.quit is sufficient for the main window. 
    //though one could do a event handler to set it as null as well:
            //mainWindow.on('closed', function () {
                //mainWindow = null
            //})
    
    //Overriding the menu
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add New Todo'
    });
    addWindow.loadURL(`file://${__dirname}/add.html`);
    addWindow.on('closed', () => addWindow = null);
}

ipcMain.on('todo:add', (event, todo) => {
    mainWindow.webContents.send('todo:add', todo);
    addWindow.close();
});

const menuTemplate = [
    {
        label : 'File',
        submenu: [
            { 
                label: 'New Todo',
                click() { createAddWindow(); }
            },
            {
                label: 'Clear Todo List',
                click() {
                    mainWindow.webContents.send('todo:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q' ,
                click() {
                    app.quit();
                }
            }
        ]
    }
]

if (process.platform === 'darwin') {
    menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
    menuTemplate.push({
        label: 'Developer',
        submenu: [
            { role: 'reload'},
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();

                }
            }
        ]
    });
}

app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

