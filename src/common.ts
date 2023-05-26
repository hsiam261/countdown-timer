interface ComponentState {
    hook: ()=>void;
    registerHook: (hook: ()=> void)=> void;
}

interface EventHandlerInterface {
    eventToListen: string;
    eventHandler: (event: Event)=>void;
}

interface ComponentController<T extends ComponentState> {
    getInnerHtml: (state: T) => string;
    getEventHandlers: (state: T) => EventHandlerInterface[];
}
