
const {app, BrowserWindow} = require ('electron');
const ipcMain = require('electron').ipcMain;
const path = require ('path');
const url = require ('url');
const electron = require ('electron');
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const ctxMenu = new Menu();

let win;
let winLogin; 
let accessToken;

var eMain = {
    winSettings:null
}

app.on ('ready', function () {

    createWindow();

    ipcMain.on('gigaRaterResize', (event, sender, width, height) => {
        if (height) {
            if (sender=='index'){            
                win.setSize(width, height );
            }
            else if (sender=='login') {
                winLogin.setSize(width,height);
            }
        }
    });

    ipcMain.on ('accessTokenAquired',  (event, pAccessToken) => {
        accessToken = pAccessToken;
        ctxMenu.getMenuItemById('miLogin').visible = false;
    });

    ipcMain.on ('userNameChanged', (event, pUserName) => {
        win.webContents.send('userNameChanged', pUserName);
    });

});

function createWindow() {
    win = new BrowserWindow ({ 
        width: 220,
        height: 40, 
        frame:false, 
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + "/js/preload.js"
        },
        icon:__dirname+'/img/zelda.png'});
    win.setMenuBarVisibility(false)
    win.loadURL (url.format({
        pathname: path.join(__dirname, 'GigaRater/index.htm'),
        protocol: 'file:',
        slashes:true
    }))
    win.on('closed', () => {
        win = null;
        if (eMain.winSettings) {
            eMain.winSettings.close();
            eMain.winSettings = null;
        }
        if (winLogin) {
            winLogin.close();
            winLogin = null;
        }
    });

    ctxMenu.append(new MenuItem( {
        label: 'Start Timer',
        id: 'miStartTimer',
        click: function() {
            win.webContents.send('StartStopTimer', 'Start');
            ctxMenu.getMenuItemById('miPauseTimer').visible = true;
            ctxMenu.getMenuItemById('miStopTimer').visible = true;
            ctxMenu.getMenuItemById('miStartTimer').visible = false;
        }
    }));

    ctxMenu.append(new MenuItem( {
        label: 'Stop Timer',
        id: 'miStopTimer',
        visible: false,
        click: function() {
            win.webContents.send('StartStopTimer', 'Stop');
            ctxMenu.getMenuItemById('miPauseTimer').visible = false;
            ctxMenu.getMenuItemById('miStopTimer').visible = false;
            ctxMenu.getMenuItemById('miStartTimer').visible = true;

        }
    }));

    ctxMenu.append(new MenuItem( {
        label: 'Pause Timer',
        id: 'miPauseTimer',
        visible: false,
        click: function() {

            // win.webContents.send('StartStopTimer', 'Pause');
            // ctxMenu.getMenuItemById('miPauseTimer').visible = false;
            // ctxMenu.getMenuItemById('miStopTimer').visible = false;
            // ctxMenu.getMenuItemById('miStartTimer').visible = true;
        }
    }));

    ctxMenu.append(new MenuItem( {
        label: 'Unpause Timer',
        id: 'miUnpauseTimer',
        visible: false,
        click: function() {
            // win.webContents.send('StartStopTimer', 'Pause');
            // ctxMenu.getMenuItemById('miPauseTimer').visible = false;
            // ctxMenu.getMenuItemById('miStopTimer').visible = false;
            // ctxMenu.getMenuItemById('miStartTimer').visible = false;
        }
    }));

    ctxMenu.append(new MenuItem( {
        label: 'Login',
        id: 'miLogin',
        click: function() {
            if (!winLogin) {
                winLogin = new BrowserWindow ({ 
                    y: win.y + 24,
                    width: 378,
                    height: 320, 
                //  frame:false, 
                    webPreferences: {
                        nodeIntegration: false,
                        preload: __dirname + "/js/preload.js"
                    },
                    icon:__dirname+'/img/zelda.png'});
                    winLogin.setMenuBarVisibility(false)
                    winLogin.loadURL (url.format({
                    pathname: path.join(__dirname, './gigaRater/login.htm'),
                    protocol: 'file:',
                    slashes:true
                }))
            
                winLogin.setTitle("Login");
                winLogin.on('closed', () => {
                    winLogin = null;
                });
            }
            else {
                winLogin.show();
            }
        }
    }));   
 
    ctxMenu.append(new MenuItem( {
        label: 'Settings',
        id: 'miSettings',
        click: function() {
            if (!eMain.winSettings) {
                eMain.winSettings = new BrowserWindow ({ 
                    y: win.y + 24,
                    width: 320,  
                    webPreferences: {
                        nodeIntegration: false,
                        preload: __dirname + "/js/preload.js"
                    },
                    icon:__dirname+'/img/zelda.png'});
                    eMain.winSettings.setMenuBarVisibility(false)
                    eMain.winSettings.loadURL (url.format({
                    pathname: path.join(__dirname, './GigaRater/settings.htm'),
                    protocol: 'file:',
                    slashes:true
                }))
            
                eMain.winSettings.on('closed', () => {
                    eMain.winSettings = null;
                });
            }
            else {
                eMain.winSettings.show();
            }

        }
    }));

    ctxMenu.append(new MenuItem( {
        label: 'Exit',
        id: 'miExit',
        click: function() {
            win.close();
        }
    }));

    win.webContents.on ('context-menu', function (e,params) {
        ctxMenu.popup(win,params.x,params.y)
    })    
}

// Quit when all windows are closed
// => means run a function
app.on ('window-all-closed', () =>{
    if (process.platform !== 'darwin') {
        app.quit();
    }
})