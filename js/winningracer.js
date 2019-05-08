// window.ipcRenderer is deifned in the preload.js called when main.js instantiates the renderer app

var apiBase = "http://dadio:4242/";
var authBase = "http://73.126.27.247:4202/";
var apiURI = apiBase + 'speedrunapi/';
var authURI = authBase + 'authservice/';


window.ipcRenderer.on('StartStopTimer', (event, arg) => {
    if (arg=='Start'){
        winningracer.localTimerStart();
        return;
    }
    if (arg=='Stop'){
        winningracer.localTimerStop();
        return;
    }
    if (arg=="Pause"){

    }

})

window.ipcRenderer.on ('userNameChanged', (event, userName) => {
    document.getElementById('userName').innerHTML = userName;
})


var loginWindow = {

    fnPasswordKeyClick: function (e, textarea) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { //Enter keycode
        if (textarea.id=='txtPassword'){
            loginWindow.loginClicked();
        }
        else {
            RegClicked();
        }
        } 
    },
    
    loginClicked: function() {
        let emailAddress = document.getElementById("txtEmailAddress");
        let password = document.getElementById("txtPassword");
     
        if (emailAddress.value == ''){
           winningracer.showAppMessage ('You must enter a login name.', function(whatClicked){ 
              emailAddress.focus();
           });      
           return;
        }
     
        if (password.value == ''){
            winningracer.showAppMessage ('You must enter a password.', function(whatClicked){
              password.focus();
            });      
          return;
        }
     
        var xhttp = new XMLHttpRequest();
     
        // set up a handlers for the xhttp Post coming up
        xhttp.onreadystatechange = function() {
           if (this.readyState == 4 ) {
              if (this.status == 200) {
                 authToken.storeToken('access_token', xhttp.responseText);
                 winningracer.validSession(xhttp.responseText);
              }
              else {
                 if (this.status == 403) {
                     winningracer.showAppMessage ('You have entered an invalid username or password.', function(whatClicked){
                     password.focus();
                    });  
     
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
                    winningracer.showAppMessage("We have experienced an error: " + thisError + 
                    "  Please report this to the site admin.", function(whatClicked){ });
                 }
              }
           }
        };
     
        let body = 
           { 
              "loginName": emailAddress.value,    
              "password": password.value
           };
     
        xhttp.open("POST", authURI + "speedrunLogin/", true);
        xhttp.send(JSON.stringify(body));
    },

    loginInit: function () {
        winningracer.sendResize('login');
        loadMessageDialogPage();
        document.getElementById("txtEmailAddress").focus();
    },
}

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

    localTimerStart: function () {
        winningracer.startSeconds = new Date().getTime();
        winningracer.startTime = winningracer.startSeconds; 
    
        winningracer.localTimerRunning = true;
        winningracer.sendResize('index');
    },

    localTimerStop: function () {
        winningracer.localTimerRunning = false;

    },

 

    sendResize: function (sender) {
        let height = document.body.clientHeight;
        let width = document.body.clientWidth;
        window.ipcRenderer.send('gigaRaterResize', sender, width, height);

    },

    showAppMessage: function (displayMessage, cb) {
        document.getElementById("btnMDOK").onclick = function () {
            cb("OK");
            document.getElementById("divMessageDialogOverlay").style.display = "none";
        }
        document.getElementById("txtMDMessage").innerHTML = displayMessage;
        document.getElementById("divMessageDialogOverlay").style.display = "block";
    },

    validSession: function (pToken) {
        let stuff = authToken.parseInfo();
        let userName = stuff.userName;
        window.ipcRenderer.send('userNameChanged', userName);
        window.ipcRenderer.send('accessTokenAquired', pToken);  
        window.close();      
    }

}

async function loadMessageDialogPage() {
    const messageDialogDiv = document.getElementById("divMessageDialogOverlay");
    messageDialogDiv.innerHTML = await fetchHtmlAsText("./messagedialogPage.htm");
 }

async function fetchHtmlAsText(url) {
    const response = await fetch(url);
    return await response.text();
 }
