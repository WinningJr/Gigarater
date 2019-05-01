
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

       
    },

    localTimerStop: function () {
        winningracer.localTimerRunning = false;

    }
}