
const {app, BrowserWindow, globalShortcut} = require ('electron');
const ipcMain = require('electron').ipcMain;
const path = require ('path');
const url = require ('url');
const Store = require('./js/store.js');
const electron = require ('electron');
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const ctxMenu = new Menu();

const gigaMenus = require ('./js/GigaMenus.js')

let winManageSplits;
let winSettings;
let win;
let winLogin; 
let JWTToken;
let access_token;
let userInfo;
let timerStatus = 'Stopped';

const store = new Store({
    configName: 'user-preferences',
    defaults: {
      windowWidth: 220,
      lastWindowLocation: { x: 10, y: 10}
    }
  });

app.on ('ready', function () {
    createMainWindow();

    ipcMain.on('gigaraterResize', (event, sender, width, height) => {
        if (height) {
            if (sender=='index'){     
                // only set the height from the renderer app
                win.setSize(win.getBounds().width, height );              
            }
            else if (sender=='login') {
                winLogin.setSize(width,height);
            }
        }
    });

    ipcMain.on ('accessTokenAquired',  (event, pAccessToken) => {
        JWTToken = pAccessToken;  // no reason for this, yet
        ctxMenu.getMenuItemById('miLogin').visible = false;
        ctxMenu.getMenuItemById('miSettings').visible = true;
        // send out the message that we have logged in
        win.webContents.send('accessTokenAquired');
        access_token = pAccessToken;
    });

    ipcMain.on ('userNameChanged', (event, pUserName) => {
        win.webContents.send('userNameChanged', pUserName);
    });

    ipcMain.on ('userInfoChanged', (event, pUserInfo) => {
        userInfo = pUserInfo
        mainFunctions.userInfoChanged();
    });
});

function createMainWindow() {
    let winWidth  = store.get('windowWidth');
    let bounds = store.get('lastWindowLocation');

    win = new BrowserWindow ({ 
        width: winWidth,
        height: 40, 
        frame:false, 
        x: bounds.x,
        y: bounds.y,
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + "/js/preload.js"
        },
        icon:__dirname+'/img/zelda.png'});

    win.on('resize', () => {
        let { width, height } = win.getBounds();
        store.set('windowWidth',  width);
    });
    win.setMenuBarVisibility(false)
    win.loadURL (url.format({
        pathname: path.join(__dirname, 'Gigarater/index.htm'),
        protocol: 'file:',
        slashes:true
    }))
    win.on('close', () => {
        let bounds = win.getBounds(); 
        store.set("lastWindowLocation", {
            x: bounds.x,         
            y: bounds.y         
        });
    });
    win.on('closed', () => {
        win = null;
        if (winSettings) {
            winSettings.close();
            winSettings = null;
        }
        if (winManageSplits){
            winManageSplits.close();
            winManageSplits = null;
        }
        if (winLogin) {
            winLogin.close();
            winLogin = null;
        }
    });

    // defines the right click menus
    gigaMenus.fnMakeRightClickMenus(mainFunctions, ctxMenu);

    win.webContents.on ('context-menu', function (e,params) {
        ctxMenu.popup(win,params.x,params.y)
    })    
}

var mainFunctions = {
    startStopTimer: function (pMode) {
        let start;
        if (pMode == 'Start'){
            start = true;
            timerStatus = 'Running';
        }
        else {
            if (pMode == 'Stop') {
                start = false;
                timerStatus = 'Stopped';
            }
        }
    
        win.webContents.send('StartStopTimer', pMode);
        ctxMenu.getMenuItemById('miStopTimer').visible = start;
        ctxMenu.getMenuItemById('miStartTimer').visible = !start;
    },

    closeApp: function () {
        win.close();
    },

    doLogin: function () {
        if (!winLogin) {
            winLogin = new BrowserWindow ({ 
                y: win.y + 24,
                width: 378,
                height: 320, 
                webPreferences: {
                    nodeIntegration: false,
                    preload: __dirname + "/js/preload.js"
                },
                icon:__dirname+'/img/zelda.png'});
                winLogin.setMenuBarVisibility(false)
                winLogin.loadURL (url.format({
                pathname: path.join(__dirname, './gigarater/login.htm'),
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
    },

    showPreferences: function () {
        if (!winSettings) {
            winSettings = new BrowserWindow ({ 
                height: 480,
                width: 460,  
                title: 'Gigarator Preferences',
                webPreferences: {
                    nodeIntegration: false,
                    preload: __dirname + "/js/preload.js"
                },
                icon:__dirname+'/img/zelda.png'});
                winSettings.setMenuBarVisibility(false)
                winSettings.loadURL (url.format({
                pathname: path.join(__dirname, './Gigarater/settings.htm'),
                protocol: 'file:',
                slashes:true
            }))
        
            winSettings.on('closed', () => {
                winSettings = null;
            });
        }
        else {
            winSettings.show();                
        }
    },

    showSplits: function () {
        if (!winManageSplits) {
            winManageSplits = new BrowserWindow ({ 
                height: 480,
                width: 460,  
                title: 'Manage Splits',
                webPreferences: {
                    nodeIntegration: false,
                    preload: __dirname + "/js/preload.js"
                },
                icon:__dirname+'/img/zelda.png'});
                winManageSplits.setMenuBarVisibility(false)
                winManageSplits.loadURL (url.format({
                pathname: path.join(__dirname, './Gigarater/ManageSplits.htm'),
                protocol: 'file:',
                slashes:true
            }))
        
            winManageSplits.on('closed', () => {
                winManageSplits = null;
            });
        }
        else {
            winManageSplits.show();                
        }
    },

    userInfoChanged: function () {
        globalShortcut.unregisterAll();
        if (userInfo.EnableGlobalShortCuts==true) {
            // turn on the global shortcuts
            //StartSplit
            let statStopKey = '';
    
            if (userInfo.startSplitDataKey && userInfo.startSplitDataKey!='') {
                if (userInfo.startSplitCtrlPressed=='true') {
                    startStopKey = 'CommandOrControl+' + userInfo.startSplitDataKey;
                } 
                else {   
                    startStopKey = userInfo.startSplitDataKey;
                }
                globalShortcut.register(startStopKey, () => {
                    if (timerStatus=='Stopped') {
                        mainFunctions.startStopTimer ('Start');
                        return;
                    }
                    if (timerStatus=='Running'){
                        mainFunctions.startStopTimer ('Stop');
                        return;
                    }
                })
            }
        }
    }
}

// Quit when all windows are closed
// => means run a function
app.on ('window-all-closed', () =>{
    if (process.platform !== 'darwin') {
        app.quit();
    }
})