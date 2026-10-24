"use strict";
var TimerMode;
(function (TimerMode) {
    TimerMode[TimerMode["COUNTDOWN"] = 0] = "COUNTDOWN";
    TimerMode[TimerMode["TIMER"] = 1] = "TIMER";
})(TimerMode || (TimerMode = {}));
class Timer {
    constructor(mode = TimerMode.COUNTDOWN) {
        this.remainingTime = 0;
        this.startTime = 0;
        this.step = 0.01;
        this.callback = () => { };
        this.finishCallback = () => { };
        this.paused = false;
        this.stopped = false;
        this.finished = false;
        this.loopFunc = () => {
            if (this.paused || this.stopped) {
                return;
            }
            this.modeFunc();
            this.callback();
            if (this.finished) {
                this.finishCallback();
            }
            else {
                $.Schedule(this.step, this.loopFunc);
            }
        };
        this.countdown = () => {
            var remainingTime = this.startTime - Game.GetGameTime();
            this.remainingTime = remainingTime <= 0 ? 0 : remainingTime;
            if (this.remainingTime <= 0) {
                this.finished = true;
                return;
            }
        };
        this.reset();
        this.setMode(mode);
    }
    setCallback(callback) {
        this.callback = callback;
    }
    setFinishCallback(finishCallback) {
        this.finishCallback = finishCallback;
    }
    setMode(mode) {
        switch (mode) {
            case TimerMode.COUNTDOWN:
                this.modeFunc = this.countdown;
                break;
            default: this.modeFunc = this.countdown;
        }
    }
    setStartTime(currentTime) {
        this.remainingTime = currentTime;
    }
    setStep(step) {
        this.step = step;
    }
    reset() {
        this.remainingTime = 0;
        this.step = 0.01;
        this.setMode(TimerMode.COUNTDOWN);
        this.paused = false;
        this.stopped = false;
        this.finished = false;
    }
    start() {
        this.stopped = false;
        this.startTime = Game.GetGameTime() + this.remainingTime;
        $.Schedule(this.step, this.loopFunc);
    }
    resume() {
        this.paused = false;
        this.startTime = Game.GetGameTime() + this.remainingTime;
        $.Schedule(this.step, this.loopFunc);
    }
    stop() {
        this.stopped = true;
    }
    pause() {
        this.paused = true;
    }
    formatTime(seconds) {
        var hours = Math.floor(seconds / 3600);
        var remainder = seconds % 3600;
        var minutes = Math.floor(remainder / 60);
        var seconds = Math.floor(remainder % 60);
        var s = "";
        var m = "";
        var h = "";
        if (seconds < 10)
            s = "0";
        if (minutes < 10)
            m = "0";
        if (hours < 10)
            h = "0";
        return h + hours + ":" + m + minutes + ":" + s + seconds;
    }
    getTimeString() {
        return this.formatTime(this.remainingTime);
    }
    isFinished() {
        return this.finished;
    }
}
