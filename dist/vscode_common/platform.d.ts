export interface IProcessEnvironment {
    [key: string]: string;
}
export declare const isWindows: boolean;
export declare const isMacintosh: boolean;
export declare const isLinux: boolean;
export declare const isWeb: boolean;
export declare const globals: any;
interface ISetImmediate {
    (callback: (...args: any[]) => void): void;
}
export declare const setImmediate: ISetImmediate;
export {};
