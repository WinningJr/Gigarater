var authToken;

var apiBase = "http://73.126.27.247:4242/";
var authBase = "http://73.126.27.247:4202/";
var apiURI = apiBase + 'speedrunapi/';
var authURI = authBase + 'authservice/';

var  common = {
   storagePrefix: 'winningracer',
   clearFromSessionStorage: function (name) {
      var storageName = this.storagePrefix + name;
      window.sessionStorage.clear(storageName);	
   },

   clearFromLocalStorage: function (name) {
      var storageName = this.storagePrefix + name;
      window.localStorage.clear(storageName);	
   },
 
   getFromLocalStorage: function (name) {
      var storageName = this.storagePrefix + name;
      return window.localStorage.getItem(storageName);	
   },
 
   getFromSessionStorage: function (name) {
      var storageName = this.storagePrefix + name;
      return window.sessionStorage.getItem(storageName);	
   },
 
   putInLocalStorage: function (name, whatToStore) {
      var storageName = this.storagePrefix + name;
      window.localStorage.setItem(storageName, whatToStore);	
   },
 
   putInSessionStorage: function (name, whatToStore) {
      var storageName = this.storagePrefix + name;
      window.sessionStorage.setItem(storageName, whatToStore);	
   },
   
   showAppMessage: function (displayMessage, cb) {
      document.getElementById("btnMDOK").onclick = function () {
          cb("OK");
          document.getElementById("divMessageDialogOverlay").style.display = "none";
      }
      document.getElementById("txtMDMessage").innerHTML = displayMessage;
      document.getElementById("divMessageDialogOverlay").style.display = "block";
  }
}



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
          common.showAppMessage ('You must enter a login name.', function(whatClicked){ 
             emailAddress.focus();
          });      
          return;
       }
    
       if (password.value == ''){
         common.showAppMessage ('You must enter a password.', function(whatClicked){
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
                     common.showAppMessage ('You have entered an invalid username or password.', function(whatClicked){
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
                   common.showAppMessage("We have experienced an error: " + thisError + 
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
       loginWindow.sendResize();
       loadMessageDialogPage();
       document.getElementById("txtEmailAddress").focus();
       document.getElementById("txtEmailAddress").value = 'gwinning@gmail.com';
       document.getElementById("txtPassword").value = 'Jacob666';
   },

   sendResize: function () {
      let height = document.body.clientHeight;
      let width = document.body.clientWidth;
      window.ipcRenderer.send('gigaRaterResize', 'login', width, height);

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

