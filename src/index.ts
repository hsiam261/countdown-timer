import { ResetButton, ResetButtonController, StartButton, StartButtonController, StartButtonState } from "./buttons/button";
import { Timer, TimerController, TimerState } from "./timer/timer";
import { TimerBuffer, TimerBufferController } from "./timerBuffer/timerBuffer";

const parentDiv = {
    showBuffer: false,
    timerBuffer: new TimerBuffer(),
    timer: new Timer(0),
    resetButton: new ResetButton(),
    startButton: new StartButton()
}

function drawTimer() {
    let timerContainer: HTMLElement = document.getElementById('timer-container') as HTMLElement;
    if(parentDiv.showBuffer) return;

    let timerDiv = document.getElementById('timer-div');
    if(timerDiv !==null) {
        let innerHtml: string = `${new TimerController().getInnerHtml(parentDiv.timer)}`
        timerDiv.innerHTML = innerHtml;
        return;
    }

    let innerHtml: string = `<div id="timer-div">${new TimerController().getInnerHtml(parentDiv.timer)}</div>`
    timerContainer.innerHTML = innerHtml;
    timerDiv = document.getElementById('timer-div');
    for(let eventHandler of new TimerController().getEventHandlers(parentDiv.timer)) {
        timerDiv?.addEventListener(eventHandler.eventToListen, eventHandler.eventHandler);
    }
}

function drawTimerBuffer() {
    let timerContainer: HTMLElement = document.getElementById('timer-container') as HTMLElement;
    if(parentDiv.showBuffer === false)  return;

    let timerBufferDiv = document.getElementById('timer-buffer-div');
    if(timerBufferDiv !== null) {
        let innerHtml: string = `${new TimerBufferController().getInnerHtml(parentDiv.timerBuffer)}`
        timerBufferDiv.innerHTML = innerHtml;
        timerBufferDiv?.focus();
        return;
    }

    let innerHtml: string = `<div id="timer-buffer-div" tabindex=0>${new TimerBufferController().getInnerHtml(parentDiv.timerBuffer)}</div>`
    timerContainer.innerHTML = innerHtml;

    timerBufferDiv = document.getElementById('timer-buffer-div');
    for(let eventHandler of new TimerBufferController().getEventHandlers(parentDiv.timerBuffer)) {
        timerBufferDiv?.addEventListener(eventHandler.eventToListen, eventHandler.eventHandler);
    }
    timerBufferDiv?.focus();

}


function draw() {
    let timerContainer: HTMLElement = document.getElementById('timer-container') as HTMLElement;
    if(parentDiv.showBuffer) {
        drawTimerBuffer();
    } else {
        drawTimer();
    }

    let buttonContainer: HTMLElement = document.getElementById('button-container') as HTMLElement;
    let startButtonHtml: string = new StartButtonController().getInnerHtml(parentDiv.startButton);
    let resetButtonHtml: string = new ResetButtonController().getInnerHtml(parentDiv.resetButton);

    buttonContainer.innerHTML = `${startButtonHtml}\n${resetButtonHtml}`;

    let startButtonElement: HTMLElement = document.getElementById('start-stop-button') as HTMLElement;
    for(let eventHandler of new StartButtonController().getEventHandlers(parentDiv.startButton)) {
        startButtonElement.addEventListener(eventHandler.eventToListen, eventHandler.eventHandler);
    }

    let resetButtonElement: HTMLElement = document.getElementById('reset-button') as HTMLElement;
    for(let eventHandler of new ResetButtonController().getEventHandlers(parentDiv.startButton)) {
        resetButtonElement.addEventListener(eventHandler.eventToListen, eventHandler.eventHandler);
    }


}

function init() {
    parentDiv.timer.registerHook(draw);
    parentDiv.timerBuffer.registerHook(draw);
    parentDiv.startButton.registerHook(draw);
    parentDiv.resetButton.registerHook(draw);

    console.log('Draw');
    draw();

    let timerContainer: HTMLElement = document.getElementById('timer-container') as HTMLElement;
    let container: HTMLElement = document.getElementById('container') as HTMLElement;

    timerContainer.addEventListener('focusTimerBuffer', (event: Event)=>{
        console.log('What?', event.target);
        parentDiv.showBuffer = true;
        parentDiv.timerBuffer.setBuffer(0);
        parentDiv.timer.timerState = TimerState.PAUSED;
        parentDiv.startButton.buttonState = StartButtonState.START;
        draw();

        let timerBufferDiv = document.getElementById('timer-buffer-div');
        timerBufferDiv?.focus();
        console.log(timerBufferDiv);
        console.log(document.activeElement);
        console.log('bye');
    });

    timerContainer.addEventListener('blurTimerBuffer', (event: Event)=>{
        console.log('?');
        parentDiv.showBuffer = false;
        parentDiv.timer.reinitializeClock(parentDiv.timerBuffer.getTicks());
        event.stopPropagation();
        draw();
    });

    document.addEventListener('click', (event)=>{
        let element: HTMLElement = event.target as HTMLElement;
        if(element.id !== 'timer') {
            timerContainer.dispatchEvent(new CustomEvent('blurTimerBuffer', {
                bubbles: false
            }));
        }
    });

    container.addEventListener('startTimer', (event)=>{
        let timerDiv = document.getElementById('timer-div');

        if(timerDiv === null) {
            parentDiv.showBuffer = false;
            parentDiv.timer.reinitializeClock(parentDiv.timerBuffer.getTicks());
            event.stopPropagation();
            draw();
        }
        timerDiv = document.getElementById('timer-div');
        timerDiv?.dispatchEvent(new CustomEvent('startTimer', {
            bubbles: false
        }));
    });

    container.addEventListener('pauseTimer', (event)=>{
        let timerDiv = document.getElementById('timer-div');
        if(timerDiv) {
            timerDiv.dispatchEvent(new CustomEvent('pauseTimer', {
                bubbles: false
            }));
        }
    });

    container.addEventListener('resetTimer', (event)=>{
        let timerDiv = document.getElementById('timer-div');
        if(timerDiv) {
            timerDiv.dispatchEvent(new CustomEvent('resetTimer', {
                bubbles: false
            }));
        }

        let startButton = document.getElementById('start-stop-button');
        if(startButton) {
            startButton.dispatchEvent(new CustomEvent('resetTimer', {
                bubbles: false
            }));
        }
    });


    container.addEventListener('timerDone', (event)=>{
        console.log('timer DONE');
        container.dispatchEvent(new CustomEvent('resetTimer', {
            bubbles: false
        }));
        event.stopPropagation();
    })

}

init();
