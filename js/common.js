


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
 
    }
 }

 var settingsWindow = {
    showFrame: function (cBox) {
       common.putInLocalStorage

    }
 }