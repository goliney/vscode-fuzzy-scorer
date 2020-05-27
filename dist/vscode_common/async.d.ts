export interface IDisposable {
    dispose(): void;
}
export interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): number;
}
/**
 * Execute the callback the next time the browser is idle
 */
export declare let runWhenIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable;
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
export declare class IdleValue<T> {
    private readonly _executor;
    private readonly _handle;
    private _didRun;
    private _value?;
    private _error;
    constructor(executor: () => T);
    dispose(): void;
    get value(): T;
}
