enum StartButtonState {
    START,
    PAUSE
}

class StartButton implements ComponentState {
    public buttonState: StartButtonState;
    public hook: () => void;

    public constructor() {
        this.buttonState = StartButtonState.START;
        this.hook = ()=>{};
    }

    public registerHook(hook: () => void): void {
        this.hook = hook;
    }

    public click(): void {
        if(this.buttonState === StartButtonState.START) {
            this.buttonState = StartButtonState.PAUSE;
        } else {
            this.buttonState = StartButtonState.START;
        }

        this.hook();
    }
}

class StartButtonController implements ComponentController<StartButton> {
    public getInnerHtml(startButton: StartButton): string {
        let buttonClassPrefix: string = StartButtonState[startButton.buttonState].toLowerCase();
        let label: string = buttonClassPrefix[0].toUpperCase() + buttonClassPrefix.substring(1);
        return `<button type="button" id="start-stop-button" class="${buttonClassPrefix}-button">${label}</button>`
    };

    public getEventHandlers(startButton: StartButton): EventHandlerInterface[] {
        const clickHandler: EventHandlerInterface = {
            eventToListen: 'click',
            eventHandler: (event: Event)=>{
                const element: HTMLElement = event.target as HTMLElement;
                let buttonClassPrefix: string = StartButtonState[startButton.buttonState].toLowerCase();
                console.log(`${buttonClassPrefix}Timer`);
                element.dispatchEvent(new CustomEvent(`${buttonClassPrefix}Timer`, {
                    'bubbles': true
                }));
                startButton.click();
                event.stopPropagation();
            }
        };

        const focusTimerBufferHandler: EventHandlerInterface = {
            eventToListen: 'focusTimerBuffer',
            eventHandler: (event: Event)=>{
                startButton.buttonState = StartButtonState.START;
                startButton.hook();
                event.stopPropagation();
            }
        };

        const resetButtonHandler: EventHandlerInterface = {
            eventToListen: 'resetTimer',
            eventHandler: (event: Event)=>{
                startButton.buttonState = StartButtonState.START;
                startButton.hook();
                event.stopPropagation();
            }
        };



        return [clickHandler, focusTimerBufferHandler, resetButtonHandler];
    }

}

class ResetButton implements ComponentState {
    public hook: () => void;
    public constructor() {
        this.hook = ()=>{};
    }

    public registerHook(hook: () => void): void {
        this.hook = hook;
    }
}

class ResetButtonController implements ComponentController<ResetButton> {
    public getInnerHtml(state: ResetButton): string {
        return `<button type="button" id="reset-button" class="reset-button">Reset</button>`
    }

    public getEventHandlers(state: ResetButton): EventHandlerInterface[] {
        const clickHandler: EventHandlerInterface = {
            eventToListen: 'click',
            eventHandler: (event: Event)=>{
                console.log(':)');
                const element: HTMLElement = event.target as HTMLElement;
                element.dispatchEvent(new CustomEvent('resetTimer', {
                    'bubbles': true,
                }));
            }
        };

        return [clickHandler];
    }
}


export { StartButton, StartButtonController, ResetButton, ResetButtonController, StartButtonState }
