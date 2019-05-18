// window.ipcRenderer is deifned in the preload.js called when main.js instantiates the renderer app

var apiBase = "http://73.126.27.247:4242/";
var apiURI = apiBase + 'speedrunapi/';

window.ipcRenderer.on('StartStopTimer', (event, arg) => {
    if (arg=='Start'){
        winningracer.localTimerStart(false, 0);
        return;
    }
    if (arg=='Stop'){
        winningracer.localTimerStop();
        return;
    }
    if (arg=="Pause"){
        winningracer.localTimerStop();
        return;
    }
    if (arg=="UnPause"){
        winningracer.localTimerStart(false, 0);
        return;
    }
})

window.ipcRenderer.on ('accessTokenAquired', (event) => {
    authToken.loadTokensFromStorage();

    //Get userInfo and send it to the main.js
    let stuff = authToken.parseInfo();
    let userName = stuff.userName;
    var xhttp = new XMLHttpRequest();
 
    // set up a handlers for the xhttp Post coming up
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {              
            if (this.status == 200) {
                let userInfo = JSON.parse (xhttp.responseText)     
                window.ipcRenderer.send('userInfoChanged', userInfo);
            }
            else {
              if (this.status == 403) {
                  alert (403);
                // common.showAppMessage ('You have entered an invalid username or password.', function(whatClicked){
                    //  password.focus();
                    // });  
                }
                else {
                    let thisError = "Unknown Error"
                    try {
                        let jsonError = JSON.parse(xhttp.responseText);
                        thisError = jsonError.error;
                    }
                    catch (e) {
                        thisError = xhttp.responseText;
                    }
                    alert (xhttp.responseText + "  aa");
                    // common.showAppMessage("We have experienced an error: " + thisError + 
                    // "  Please report this to the site admin.", function(whatClicked){ });
                }
            }
        }
    };

    xhttp.open("GET", apiURI + "user/" + userName, true);
    xhttp.setRequestHeader('x-access-token', authToken.access_token);
    xhttp.send();
})

window.ipcRenderer.on ('userNameChanged', (event, userName) => {
    document.getElementById('userName').innerHTML = userName;
})

var winningracer = {
    startSeconds: null,
    uiManager:null,
    startTime:null,
    seconds: 0,
    minutes: 0,
    hours: 0,
    milliseconds: 0,
    localTimerRunning: false,

    init: function () {
        winningracer.uiManager = setInterval (function() {winningracer.uiControl()}, 100);
        winningracer.hours = "00";
        winningracer.minutes = "00";
        winningracer.seconds = "00";
        winningracer.milliseconds = "0";
        document.getElementById("divTop").style.webkitAppRegion = "drag";
        winningracer.sendResize('index');

    },

    invalidSession: function () {

    },

  

    uiControl: function(){
        if (winningracer.localTimerRunning) {
            var duration = Math.round( (new Date().getTime() - winningracer.startTime));
    
            winningracer.milliseconds = parseInt((duration % 1000) / 100),
            winningracer.seconds = Math.floor((duration / 1000) % 60),
            winningracer.minutes = Math.floor((duration / (1000 * 60)) % 60),
            winningracer.hours = Math.floor((duration / (1000 * 60 * 60)) );
            winningracer.hours = (winningracer.hours < 10) ? "0" + winningracer.hours : winningracer.hours;
            winningracer.minutes = (winningracer.minutes < 10) ? "0" + winningracer.minutes : winningracer.minutes;
            winningracer.seconds = (winningracer.seconds < 10) ? "0" + winningracer.seconds : winningracer.seconds;
        } 
        else {

        }
                
        document.getElementById('spanTimer').innerHTML = winningracer.hours + ":" + 
            winningracer.minutes + ":" + winningracer.seconds + "." + 
            winningracer.milliseconds;
    },

    localTimerStart: function (pNew, pIncrement) {
        if (pNew || !winningracer.startTime) {
            winningracer.startSeconds = new Date().getTime();
            winningracer.startTime = winningracer.startSeconds; 
        }

        winningracer.localTimerRunning = true;
    },

    localTimerStop: function () {
        winningracer.localTimerRunning = false;

    },

    sendResize: function (sender) {
        let height = document.body.clientHeight;
        let width = document.body.clientWidth;
        window.ipcRenderer.send('gigaRaterResize', sender, width, height);

    },

    validSession: function (pToken) {
        let stuff = authToken.parseInfo();
        let userName = stuff.userName;
        window.ipcRenderer.send('userNameChanged', userName);
        window.ipcRenderer.send('accessTokenAquired', pToken);  
        window.close();      
    }

}

var settingsWindow = {
    windowInit: function() {
        settingsWindow.loadUserInfo();
    },
 
    cbShowServerMessages: function(e) {
    //    common.putInLocalStorage('showServerMessaes', e.checked);	
    //    window.ipcRenderer.send('showVCRButtonsChanged', e.checked);
    },

    loadUserInfo: function () {
        authToken.loadTokensFromStorage();
        let stuff = authToken.parseInfo();
        let userName = stuff.userName;
        var xhttp = new XMLHttpRequest();
     
        // set up a handlers for the xhttp Post coming up
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 ) {              
                if (this.status == 200) {
                    let userInfo = JSON.parse (xhttp.responseText)     
                    
                    //StartStop
                    let ctrlPressed = (userInfo.startSplitCtrlPressed == 'true');

                    if (ctrlPressed) {
                        txtStartSplit.setAttribute('data-key', userInfo.startSplitDataKey );
                        txtStartSplit.setAttribute('data-ctrl-pressed', true);
                        txtStartSplit.value = 'CTRL-' + userInfo.startSplitDataKey ;
                    }
                    else  {
                        txtStartSplit.setAttribute('data-key', userInfo.startSplitDataKey );
                        txtStartSplit.setAttribute('data-ctrl-pressed', false);
                        txtStartSplit.value = userInfo.startSplitDataKey ;    
                    }

                    document.getElementById('cbEnableGlobalShortcuts').checked = (userInfo.EnableGlobalShortCuts==true);
                }
                else {
                  if (this.status == 403) {
                      alert (403);
                    // common.showAppMessage ('You have entered an invalid username or password.', function(whatClicked){
                        //  password.focus();
                        // });  
                    }
                    else {
                        let thisError = "Unknown Error"
                        try {
                            let jsonError = JSON.parse(xhttp.responseText);
                            thisError = jsonError.error;
                        }
                        catch (e) {
                            thisError = xhttp.responseText;
                        }
                        alert (xhttp.responseText + "  aa");
                        // common.showAppMessage("We have experienced an error: " + thisError + 
                        // "  Please report this to the site admin.", function(whatClicked){ });
                    }
                }
            }
        };
    
        xhttp.open("GET", apiURI + "user/" + userName, true);
        xhttp.setRequestHeader('x-access-token', authToken.access_token);
        xhttp.send();
    },

    generalSettingsClicked: function () {
        document.getElementById("divGlobalShortCuts").style.display = 'none';
        document.getElementById("divGeneralSettings").style.display = 'flex';
    },

    globalShortCutsClicked: function () {
        document.getElementById("divGlobalShortCuts").style.display = 'flex';
        document.getElementById("divGeneralSettings").style.display = 'none';
    },

    txtStartKeyUp: function (widget) { 
        if ( (event.keyCode > 47  && event.keyCode < 91) || (event.keyCode >111 && event.keyCode < 124) )  {
            if (event.ctrlKey) {
                widget.value = "CTRL-" + event.key;
                widget.setAttribute('data-ctrl-pressed', true);
                widget.setAttribute('data-key', event.key);
            }
            else {
                widget.value=event.key;
                widget.setAttribute('data-ctrl-pressed', false);
                widget.setAttribute('data-key', event.key);
            }
        }
    },

    txtStartSplitKeyPress: function (widget) {
        event.preventDefault();
        return false;
    },

    btnEditCancelClick: function (button) {
        if (button.innerHTML == 'Edit') {
            document.getElementById('btnSave').style.visibility = 'visible';
            button.innerHTML = 'Cancel';
            document.getElementById('txtStartSplit').disabled = false;
            document.getElementById('txtStartSplit').focus();
        }
        else {
            // Cancel
            document.getElementById('txtStartSplit').disabled = true;
            document.getElementById('btnSave').style.visibility = 'hidden';
            button.innerHTML = 'Edit';
            settingsWindow.loadUserInfo();
        }
    },

    btnGeneralEditCancelClick: function (button) {
        if (button.innerHTML == 'Edit') {
            document.getElementById('btnGeneralSave').style.visibility = 'visible';
            button.innerHTML = 'Cancel';
            document.getElementById('cbEnableGlobalShortcuts').disabled = false;
            document.getElementById('cbEnableGlobalShortcuts').focus();
        }
        else {
            // cancel
            document.getElementById('cbEnableGlobalShortcuts').disabled = true;
            document.getElementById('btnGeneralSave').style.visibility = 'hidden';
            button.innerHTML = 'Edit';
            settingsWindow.loadUserInfo();
        }
    },    

    saveUserInfo: function (userInfo, cb) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 ) {              
                if (this.status == 200) {
                    authToken.loadTokensFromStorage();
                    window.ipcRenderer.send('userInfoChanged', userInfo);
                    cb(true);
                }
                else {
                    let thisError = "Unknown Error"
                    try {
                        let jsonError = JSON.parse(xhttp.responseText);
                        thisError = jsonError.error;
                    }
                    catch (e) {
                        thisError = xhttp.responseText;
                    }
                    console.log (thisError);
                    cb (false);
                }
            }
        };
    
        xhttp.open("POST", apiURI + "user", true);
        xhttp.send(JSON.stringify(userInfo));
    },

    btnSaveClick: function (button) {
        let stuff = authToken.parseInfo();
        let userName = stuff.userName;
        let userInfo = {
            'userName': userName,
            'startSplitCtrlPressed': document.getElementById('txtStartSplit').getAttribute('data-ctrl-pressed'),
            'startSplitDataKey': document.getElementById('txtStartSplit').getAttribute('data-key'),
            'EnableGlobalShortCuts': document.getElementById('cbEnableGlobalShortcuts').checked
        };

        settingsWindow.saveUserInfo(userInfo, function (pSuccess) {
            if (pSuccess) {
                document.getElementById('txtStartSplit').disabled = true;
                button.style.visibility = 'hidden';
                document.getElementById('btnEditCancel').innerHTML = 'Edit';
            }
        });
    },

    btnGeneralSaveClick: function (button) {
        let stuff = authToken.parseInfo();
        let userName = stuff.userName;
        let userInfo = {
            'userName': userName,
            'startSplitCtrlPressed': document.getElementById('txtStartSplit').getAttribute('data-ctrl-pressed'),
            'startSplitDataKey': document.getElementById('txtStartSplit').getAttribute('data-key'),
            'EnableGlobalShortCuts': document.getElementById('cbEnableGlobalShortcuts').checked
        };

        settingsWindow.saveUserInfo(userInfo, function (pSuccess) {
            if (pSuccess) {
                document.getElementById('cbEnableGlobalShortcuts').disabled = true;
                button.style.visibility = 'hidden';
                document.getElementById('btnGeneralEditCancel').innerHTML = 'Edit';
            }
        });
    }
  }
