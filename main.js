
const {app, BrowserWindow} = require ('electron');

const path = require ('path');
const url = require ('url');
const electron = require ('electron');
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
let win;



function createWindow() {
    win = new BrowserWindow ({ 
        width: 220, 
        frame:false, 
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + "/js/preload.js"
        },
        icon:__dirname+'/img/zelda.png'});
    win.setMenuBarVisibility(false)
    win.loadURL (url.format({
        pathname: path.join(__dirname, 'index.htm'),
        protocol: 'file:',
        slashes:true
    }))

    win.on('closed', () => {
        win = null;
    });
}

app.on ('ready', function () {
    createWindow();

    const ctxMenu = new Menu();
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
            win.webContents.send('StartStopTimer', 'Pause');
            ctxMenu.getMenuItemById('miPauseTimer').visible = false;
            ctxMenu.getMenuItemById('miStopTimer').visible = false;
            ctxMenu.getMenuItemById('miStartTimer').visible = true;
        }
    }));

    ctxMenu.append(new MenuItem( {
        label: 'Unpause Timer',
        id: 'miUnpauseTimer',
        visible: false,
        click: function() {
            win.webContents.send('StartStopTimer', 'Pause');
            ctxMenu.getMenuItemById('miPauseTimer').visible = false;
            ctxMenu.getMenuItemById('miStopTimer').visible = false;
            ctxMenu.getMenuItemById('miStartTimer').visible = false;
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
});

// Quit when all windows are closed
// => means run a function

app.on ('window-all-closed', () =>{
    if (process.platform !== 'darwin') {
        app.quit();
    }
})