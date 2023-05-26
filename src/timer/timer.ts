import { TimerBuffer } from '../timerBuffer/timerBuffer';
import {
    getSeconds,
    getMinutes,
    getHours,
    toTwoDigitString
} from '../utils/utils'

enum TimerState {
    RUNNING,
    PAUSED
};

const tickAudio = new Audio('./assets/tick.mpeg');
const timerDone = new Audio('./assets/ting.mp3');

class Timer implements ComponentState {
    public initialTicks: number;
    public ticks: number;
    public timerState: TimerState
    public hook: () => void;

    public constructor(initialTicks: number) {
        this.initialTicks = initialTicks;
        this.ticks = initialTicks;
        this.timerState = TimerState.PAUSED;
        this.hook = ()=>{};
    }

    public registerHook(hook: () => void): void {
        this.hook = hook;
    }

    public reinitializeClock(initialTicks: number): void {
        this.initialTicks = initialTicks;
        this.ticks = initialTicks;
        this.hook();
    }

    public pauseClock(): void {
        if(this.timerState === TimerState.PAUSED) return;
        this.timerState = TimerState.PAUSED;
        this.hook();
    }

    public tickClock(): void {
        if(this.timerState !== TimerState.RUNNING || this.ticks <= 0) return;
        this.ticks--;
        if(this.ticks > 0) tickAudio.play();
        else timerDone.play();

        this.hook();
    }

    public startClock(): void {
        tickAudio.play();
        if(this.timerState === TimerState.RUNNING) return;
        this.timerState = TimerState.RUNNING;
        this.hook();
    }

}

class TimerController implements ComponentController<Timer> {
    public getInnerHtml(timer: Timer): string {
        let ticks = timer.ticks;
        let ss: string = toTwoDigitString(getSeconds(ticks));
        let mm: string = toTwoDigitString(getMinutes(ticks));
        let hh: string = toTwoDigitString(getHours(ticks));

        let spaceSep: string = '<span class=timer-sep> </span>';

        let ssHtml: string = `<span class=\"timer-digit\">${ss[0]}</span><span class=\"timer-digit">${ss[1]}</span>`;
        let mmHtml: string = `<span class=\"timer-digit\">${mm[0]}</span><span class=\"timer-digit">${mm[1]}</span>`;
        let hhHtml: string = `<span class=\"timer-digit\">${hh[0]}</span><span class=\"timer-digit">${hh[1]}</span>`;

        let hhSubHtml: string = `<span class=\"timer-subscript\">h</span>`;
        let mmSubHtml: string = `<span class=\"timer-subscript\">m</span>`;
        let ssSubHtml: string = `<span class=\"timer-subscript\">s</span>`;

        let innerHtml: string = `${hhHtml}${hhSubHtml}${spaceSep}${mmHtml}${mmSubHtml}${spaceSep}${ssHtml}${ssSubHtml}`;
        return innerHtml;
    }

    public getEventHandlers(timer: Timer): EventHandlerInterface[] {
        const focusHandler: EventHandlerInterface = {
            eventToListen: 'focus',
            eventHandler: (event: Event)=>{


                const element: HTMLElement = event.target as HTMLElement;
                console.log(element, element.parentElement);
                element.dispatchEvent(new CustomEvent('focusTimerBuffer', {
                    'bubbles': true,
                }));
                timer.pauseClock();
                console.log('paused');
                event.stopPropagation();
            }
        };

        const clickHandler: EventHandlerInterface = {
            eventToListen: 'click',
            eventHandler: focusHandler.eventHandler
        };

        const startHandler: EventHandlerInterface = {
            eventToListen: 'startTimer',
            eventHandler: (event)=>{
                console.log('startTimer');
                let runTimer = function() {
                    if(timer.timerState !== TimerState.RUNNING) return;
                    if (timer.ticks <= 0) {
                        console.log('Timer Done');
                        timer.timerState = TimerState.PAUSED;
                        timer.ticks = 0;

                        let element: HTMLElement = event.target as HTMLElement;
                        console.log('Dispatched Event :)',element.parentElement, element)
                        element.dispatchEvent(new CustomEvent('timerDone', {
                            'bubbles': true
                        }));

                        timer.hook();
                        return;
                    }

                    timer.tickClock();
                    setTimeout(runTimer, 1000);
                }
                timer.startClock();
                setTimeout(runTimer, 1000);
                event.stopPropagation();
            }
        };

        const pauseHandler: EventHandlerInterface = {
            eventToListen: 'pauseTimer',
            eventHandler: (event)=>{
                timer.pauseClock();
                event.stopPropagation();
            }
        };

        const resetHandler: EventHandlerInterface = {
            eventToListen: 'resetTimer',
            eventHandler: (event)=>{
                timer.pauseClock();
                timer.reinitializeClock(timer.initialTicks);
                event.stopPropagation();
            }
        };

        return [focusHandler, clickHandler, startHandler, pauseHandler, resetHandler];
    }



}

export { Timer, TimerController, TimerState };
