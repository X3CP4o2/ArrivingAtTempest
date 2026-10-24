enum TimerMode{
    COUNTDOWN,
    TIMER
}

class Timer{

    private remainingTime: number = 0;
    private startTime: number = 0;
    private step: number = 0.01;

    private modeFunc!: () => void;

    private callback: () => void = () => {};
    private finishCallback: () => void = () => {};

    private paused: boolean = false;
    private stopped: boolean = false;

    private finished: boolean = false;

    constructor(mode = TimerMode.COUNTDOWN){
        this.reset();
        this.setMode(mode);
    }

    public setCallback( callback: () => void){
        this.callback = callback;
    }

    public setFinishCallback( finishCallback: () => void){
        this.finishCallback = finishCallback;
    }

    public setMode( mode: TimerMode) {
        switch(mode){
            case TimerMode.COUNTDOWN: this.modeFunc = this.countdown; break;
            default: this.modeFunc = this.countdown;
        }
    }

    public setStartTime( currentTime: number) {
        this.remainingTime = currentTime;
    }

    public setStep( step: number) {
        this.step = step;
    }

    public reset(){
        this.remainingTime = 0;
        this.step = 0.01;
        this.setMode(TimerMode.COUNTDOWN);
        this.paused = false;
        this.stopped = false;
        this.finished = false;
    }

    public start(){
        this.stopped = false;
        this.startTime = Game.GetGameTime() + this.remainingTime; 
        $.Schedule(this.step, this.loopFunc);
    }

    public resume() {
        this.paused = false;
        this.startTime = Game.GetGameTime() + this.remainingTime; 
        $.Schedule(this.step, this.loopFunc);
    }

    public stop() {
        this.stopped = true;
    }

    public pause() {
        this.paused = true;
    }

    private loopFunc = () => {
        if(this.paused || this.stopped){
            return;
        }
        this.modeFunc();
        this.callback();

        if(this.finished){
            this.finishCallback();
        } else {
            $.Schedule(this.step, this.loopFunc);
        }
    }

    private countdown = () => {
        var remainingTime =  this.startTime - Game.GetGameTime();
        this.remainingTime = remainingTime <= 0 ? 0 : remainingTime;

        if( this.remainingTime <= 0 ){
            this.finished = true;
            return;
        }
    }

    private formatTime(seconds: number) {
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

    public getTimeString(): string {
        return this.formatTime(this.remainingTime);
    }

    public isFinished(): boolean {
        return this.finished;
    }
}