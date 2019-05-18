var authService = {
    authURI: null,
    apiURL: null,
    debug: true,
    webApp: '',
    mfaUser: null,

    setCallbacks:  function (cbSessionExpired) {
        authToken.cbSessionExpired = cbSessionExpired;
    },

    loadUserSession: function(cbValid,cbInvalid) {
        
        var isValid = false;

        authToken.loadTokensFromStorage(function () {
            if (authToken.access_token) {
                if (authToken.accessTokenExpired()) {
                    authToken.clearSession();
                    cbInvalid();					
                } else 
                    authService.validToken(authToken.access_token,function(isValid) {
                        if (isValid === false) {
                            authToken.clearSession();
                            cbInvalid();
                        }
                        else
                            cbValid();
                    });
            } 
            else {
                cbInvalid();
            }
        });

    },

    signIn: function(uName,pWord,cbSuccess,cbFailure,cbMFA) {
        var dKey = window.localStorage.getItem('device_key_' + authService.webApp);
        var theBody = {username: uName, password: pWord, scope: this.webApp, device_key: dKey };
        authService.mfaUser = null;       
    },

    validateMFACode: function(mfaCode,cbSuccess,cbFailure) {
        var theBody = {username: authService.mfaUser, code: mfaCode };
    },
    signOut: function(cb) {
        authToken.clearSession();
        if (cb)
            cb();
    },

    validToken: function (token,cb) {
        
        cb(true);
        return;

        if (token === null) cb(false);
        
        fetch(authService.apiURI + '/ping',
        		{
        		method: 'GET',
        		mode: 'cors',
        		cache: 'no-cache',
        		headers: {
        			'Authorization': 'Bearer ' + token
        			}
        		}
        	).then(function(response) {
        		return response.json();
        	}).then(function(theJson) {
        		if (theJson.response._retVal !== '') 
        			cb(false); 
        		else 
        			cb(true);
        	});      		
    },

    exchangeAccessToken: function(cb) {
        if (this.debug) console.log('Exchanging Token');

        if (authToken.access_token === null) cb(false);	
    },
    other: function() {
    }
};


var authToken = {
    apiURI: null,
    userInfo: { name: ''},
    access_token: null,
    refresh_token: null,
    warning_minutes: 10,
    expirationCheckFrequency: 5,
    sessionTimeRemaining: 0,
    refreshTimeout: null,
    autoAccessRefresh: false,
    storage: { method: "local", prefix: "authToken_"},
    debug: false,
    useRefreshToken: false,

    init: function () {
    },

    cbSessionExpired: function () {
        if (authToken.debug) console.log("Session Expired");
    },
    cbSessionExpiring: function () {
        if (authToken.debug) console.log("Session is Expiring soon: ",this.autoAccessRefresh);
        if (this.autoAccessRefresh === true) {

            authService.exchangeAccessToken(function(status) {
                if (this.debug) console.log('Refreshed?',status);
            });
        }
    },

    getTokenExp: function () {
        if (!this.access_token) return -1;
        else return JSON.parse(atob(this.access_token.split(".")[1])).exp;

    },
    getTokenScope: function () {
        if (!this.access_token) return null;
        else return JSON.parse(atob(this.access_token.split(".")[1])).scope;

    },
    accessTokenExpired: function () {
        var tokenExpires = this.getTokenExp();

        var now = Math.round(+new Date()/1000),
            timeLeft = 0;
        if (tokenExpires) {

            timeLeft = tokenExpires - now;
            this.sessionTimeRemaining = timeLeft;

            if (timeLeft < 1) 
                return true;
            else 
                return false;
        }
    },
    accessTokenExpiring: function () {
        var tokenExpires = this.getTokenExp();

        var now = Math.round(+new Date()/1000),
            timeLeft = 0;
        if (tokenExpires) {

            timeLeft = tokenExpires - now;
            this.sessionTimeRemaining = timeLeft;
            if (timeLeft / 60 < this.warning_minutes) 
                return true;
            else 
                return false;
        }
    },
    parseAccessToken: function() {	
        if (this.debug)	console.log('Parsing Access->',this.access_token);

        if (this.access_token) {
            var tokenPayload = JSON.parse(atob(this.access_token.split(".")[1]));
            if (tokenPayload) {
                this.userInfo.name = tokenPayload.sub.replace("..","@");
                this.access_token.scope = tokenPayload.scope;				
            }
        }
        else {
            this.clearUserInfo();
        }
    },
    parseRefreshToken: function() {
        if (!this.useRefreshToken) return;

        if (this.refresh_token) {
            var tokenPayload = JSON.parse(atob(this.refresh_token.split(".")[1]));
            if (tokenPayload) {
                this.refresh_token.exp = tokenPayload.exp;
            }
        }
        else {
            if (this.debug) console.log('No refresh token.token');
        }
    },	

    parseInfo: function() {
        try {
            // Get Token Header
            const base64HeaderUrl = this.access_token.split('.')[0];
            const base64Header = base64HeaderUrl.replace('-', '+').replace('_', '/');
            const headerData = JSON.parse(window.atob(base64Header));
        
            // Get Token payload and date's
            const base64Url = this.access_token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            const dataJWT = JSON.parse(window.atob(base64));
            // add header information in the object being returned
            dataJWT.header = headerData;
        
            return dataJWT;
          } catch (err) {
            return false;
          }    
    },

    storeToken: function(tType,tValue) {

        if (this.storage.method == "session") {
            window.sessionStorage.setItem(this.storage.prefix + tType,tValue);			
        } else {
            window.localStorage.setItem(this.storage.prefix + tType,tValue);			
        }

        if (tType == "access_token") {
            this.loadTokensFromStorage();
            this.parseAccessToken();
        }
    },
    loadTokensFromStorage: function(cb) {
        var tokenValue = null;

        this.access_token = null;
        this.refresh_token = null;

        if (this.storage.method == "session") {
            this.access_token =   window.sessionStorage.getItem(this.storage.prefix + "access_token");
            if (this.useRefreshToken)
                this.refresh_token = window.sessionStorage.getItem(this.storage.prefix + "refresh_token");
        } else {
            this.access_token = window.localStorage.getItem(this.storage.prefix + "access_token");
            if (this.useRefreshToken)
                this.refresh_token = window.localStorage.getItem(this.storage.prefix + "refresh_token");			
        }
        this.parseAccessToken();

        if (this.useRefreshToken)		
            this.parseRefreshToken();

        this.checkRefresh();

        if (cb) {
            cb();
        }

    },
    clearUserInfo: function() {
        this.userInfo = {};
    },
    clearSession: function(cb) {
        if (this.debug) console.log('clearSession');
        this.access_token = null;
        this.refresh_token = null;

        if (this.storage.method == "session") {
            window.sessionStorage.removeItem(this.storage.prefix + "access_token");
            window.sessionStorage.removeItem(this.storage.prefix + "refresh_token");
        } else {
            window.localStorage.removeItem(this.storage.prefix + "access_token");
            window.localStorage.removeItem(this.storage.prefix + "refresh_token");			
        }
        this.clearRefresh();
        if (this.debug) console.log('Sesssion Cleared');
        if (cb) cb();
    },
    checkRefresh: function() {
        if (this.debug) console.log('Checking for expired or expiring token');
        if (this.debug) console.log('Time left:', this.sessionTimeRemaining / 60);

        clearTimeout(this.refreshTimeout);

        if (this.access_token && this.access_token) {
            if (this.accessTokenExpired()) {
                this.cbSessionExpired();				
            }
            else {
                if (this.accessTokenExpiring()) 
                    this.cbSessionExpiring();
                this.refreshTimeout = setTimeout(function() { authToken.checkRefresh(); },1000 * this.expirationCheckFrequency);

            }				
        }
    },
    clearRefresh: function() {
        clearTimeout(this.refreshTimeout);
    }
};