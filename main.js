
const {app, BrowserWindow} = require ('electron');
const path = require ('path');
const url = require ('url');

let win;

function createWindow() {
    win = new BrowserWindow ({width:400, height:600, icon:__dirname+'/img/zelda.png'});

    win.loadURL (url.format({
        pathname: path.join(__dirname, 'index.htm'),
        protocol: 'file:',
        slashes:true
    }))

    win.on('closed', () => {
        win = null;
    });
}

app.on ('ready', createWindow);

// Quit when all windows are closed
// => means run a function

app.on ('window-all-closed', () =>{
    if (process.platform !== 'darwin') {
        app.quit();
    }
})