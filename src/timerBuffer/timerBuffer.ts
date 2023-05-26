import {
    isDigit,
    getSeconds,
    getMinutes,
    getHours,
    toTwoDigitString
} from '../utils/utils'

class TimerBuffer implements ComponentState{
    public buffer: number[];
    public cursorPosition: number;
    public hook: ()=>void;

    public constructor() {
        this.buffer = new Array();
        this.cursorPosition = 0;
        this.hook = ()=>{ return; };
    }

    public addToBuffer(digit: number): void {
        if(!isDigit(digit)) return;
        if(this.buffer.length === 6) return;
        this.buffer.splice(this.cursorPosition, 0, digit);
        this.hook();
    }

    public deleteDigit(): void {
        if(this.cursorPosition >= this.buffer.length) return;
        this.buffer.splice(this.cursorPosition, 1);
        this.hook()
    }

    public moveCursorLeft(): void {
        if(this.cursorPosition === Math.min(this.buffer.length, 5)) return;
        this.cursorPosition++;
        this.hook();
    }

    public moveCursorRight(): void {
        if(this.cursorPosition === 0) return;
        this.cursorPosition--;
        this.hook();
    }

    public getTicks(): number {
        let ticks: number = 0;
        let multipliers: number[] = [1, 10, 60, 600, 3600, 36000];
        for(let i=0; i<this.buffer.length; i++) {
            ticks += this.buffer[i]*multipliers[i];
        }

        return ticks;
    }

    public setBuffer(ticks: number): void {
        let hh = getHours(ticks);
        let mm = getMinutes(ticks);
        let ss = getSeconds(ticks);

        this.buffer = (toTwoDigitString(hh) + toTwoDigitString(mm) + toTwoDigitString(ss)).split("").reverse().map((digit: string) => Number(digit));

        for(let i=this.buffer.length-1; i>=0; i--) {
            if(this.buffer[i] === 0) this.buffer.pop();
            else break;
        }
        this.hook();
    }

    public registerHook(hook: () => void) {
        this.hook = hook;
    }
}

class TimerBufferController implements ComponentController<TimerBuffer> {
    public getInnerHtml(timerBuffer: TimerBuffer): string {
        let ticks: number = timerBuffer.getTicks();
        let ss: string = toTwoDigitString(getSeconds(ticks));
        let mm: string = toTwoDigitString(getMinutes(ticks));
        let hh: string = toTwoDigitString(getHours(ticks));

        function getActiveClass(index: number) : string {
            return (index < timerBuffer.buffer.length) ? ' active': '';
        }

        function getDigitClass(index: number) : string {
            let with_cursor: string = ((timerBuffer.cursorPosition === index) ? ' with-cursor' : '');
            return `timer-buffer-digit${getActiveClass(index)}${with_cursor}`;
        }

        let space_sep: string = '<span class=timer-buffer-sep> </span>';

        let ssHtml: string = `<span class=\"${getDigitClass(1)}\">${ss[0]}</span><span class=\"${getDigitClass(0)}\">${ss[1]}</span>`;
        let mmHtml: string = `<span class=\"${getDigitClass(3)}\">${mm[0]}</span><span class=\"${getDigitClass(2)}\">${mm[1]}</span>`;
        let hhHtml: string = `<span class=\"${getDigitClass(5)}\">${hh[0]}</span><span class=\"${getDigitClass(4)}\">${hh[1]}</span>`;

        let hhSubHtml: string = `<span class=\"timer-buffer-subscript${getActiveClass(4)}\">h</span>`;
        let mmSubHtml: string = `<span class=\"timer-buffer-subscript${getActiveClass(2)}\">m</span>`;
        let ssSubHtml: string = `<span class=\"timer-buffer-subscript${getActiveClass(0)}\">s</span>`;

        return `${hhHtml}${hhSubHtml}${space_sep}${mmHtml}${mmSubHtml}${space_sep}${ssHtml}${ssSubHtml}`;
    }

    public getEventHandlers(timerBuffer: TimerBuffer): EventHandlerInterface[] {
        let focusHandler: EventHandlerInterface = {
            eventToListen: 'focus',
            eventHandler: (event: Event)=>{
                console.log('**focus',event);
            }
        };

        let keyHandler: EventHandlerInterface = {
            eventToListen: 'keydown',
            eventHandler: function(event: Event) {
                let keyboardEvent: KeyboardEvent = event as KeyboardEvent;
                const keyName: string = keyboardEvent.key;
                console.log(keyName);
                if('0123456789'.includes(keyName)) {
                    timerBuffer.addToBuffer(Number(keyName));
                } else if(keyName === 'ArrowLeft') {
                    timerBuffer.moveCursorLeft();
                } else if(keyName === 'ArrowRight') {
                    timerBuffer.moveCursorRight();
                } else if(keyName === 'Backspace') {
                    timerBuffer.deleteDigit();
                } else if(keyName === 'Escape' || keyName === 'Tab') {
                    console.log('blurTimerBuffer',event);
                    const element: HTMLElement = event.target as HTMLElement;
                    element.dispatchEvent(new CustomEvent('blurTimerBuffer', {
                        'bubbles': true,
                    }));
                }

                event.stopPropagation();
            }
        };

        return [keyHandler, focusHandler];
    }
}

export { TimerBuffer, TimerBufferController };
