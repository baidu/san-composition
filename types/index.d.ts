import type {Component, DefinedComponentClass} from 'san';

interface ComponentContext {
    component: Component;
    data<T = any>(name: string): DataProxy<T>;
    dispatch<TMsg>(messageName: string, message: TMsg): void;
    fire(eventName: string):void;
    fire<TEventArg>(eventName: string, eventArg: TEventArg): void;
    ref<TCmpt extends Component<{}>>(refName: string): TCmpt;
    ref(refName: string): Component<{}> | Element;
    (handler: () => void): void;
}

declare type Creator = (context?: ComponentContext) => void;
type SanLike = {
    [key: string]: any;
    Component: Component;
};


export declare function defineComponent<
    ExportDataT extends {} = {}, 
    ExportInterface extends {} = {}
>(creator: Creator, san: SanLike): DefinedComponentClass<ExportDataT, ExportInterface>;


export declare function template(tpl: string): void;
export declare function template(tpl: TemplateStringsArray, ...args: string[]): void;

type Get<T, K> = K extends `${infer L}.${infer R}`
    ? L extends keyof T
        ? Get<T[L], R>
        : any
    : K extends `${infer First}[${infer Tail}]`
        ? First extends keyof T
            ? T[First] extends Array<infer AT> ? AT : any
            : any
        : K extends keyof T
            ? T[K]
            : any
;

interface SpliceArgs {
    [index: number]: any;
    0: number;
    1?: number;
}

declare class DataProxy<T = any> {
    name: string;
    constructor(name: string);

    get(): T;
    get<TPath extends string>(name: TPath):  Get<T, TPath>;

    set(value: T): void;
    set<TPath extends string>(name: TPath, value: Get<T, TPath>):  void;

    merge(source: Partial<T>): void;
    merge<TPath extends string>(name: TPath, source: Partial<Get<T, TPath>>): void;

    apply(changer: (oldValue: T) => T): void;
    apply<TPath extends string>(name: TPath, changer: (oldValue: Get<T, TPath>) => Get<T, TPath>): void;

    push(name: string, item: any): number;
    push(item: any): number;

    pop(name?: string): any;

    shift(name?: string): number;

    unshift(name: string, item: any): number;
    unshift(item: any): number;

    remove(name: string, item: any): void;
    remove(item: any): void;

    removeAt(index: number): void;
    removeAt(name: string, index: number): void;

    splice(name: string, args: SpliceArgs): void;
    splice(args: SpliceArgs): void;
}

export declare function data(name: string, value: any): DataProxy;
export declare function data<T>(name: string, value: T): DataProxy<T>;


declare class ComputedProxy<T> {
    name: string;
    constructor(name: string);
    get(): T;
}

export declare function computed(name: string, fn: () => any): ComputedProxy<any>;
export declare function computed<T>(name: string, fn: () => T): ComputedProxy<T>;

export declare function filters(
    name: string, 
    component: (value: any, ...filterOption: any[]) => any
): void;
export declare function filters(filters: {
    [k: string]: (value: any, ...filterOption: any[]) => any;
}): void;


export declare function components(name: string, component: DefinedComponentClass<{}, {}>): void;
export declare function components(components: {
    [key: string]: DefinedComponentClass<{}, {}>;
}): void;

type LifeCycleHook = (handler: () => void) => void;
export declare const onConstruct: LifeCycleHook;
export declare const onCompiled: LifeCycleHook;
export declare const onInited: LifeCycleHook;
export declare const onCreated: LifeCycleHook;
export declare const onAttached: LifeCycleHook;
export declare const onDetached: LifeCycleHook;
export declare const onDisposed: LifeCycleHook;
export declare const onUpdated: LifeCycleHook;
export declare const onError: LifeCycleHook;



export declare function messages(
    name: string, 
    msgFn: (arg?: {name?: string, target?: Component<{}>, value?: unknown}) => void
): void;
export declare function messages(msgs: {
    [k: string]: (arg?: {name?: string, target?: Component<{}>, value?: unknown}) => void;
}): void;

export declare function watch(
    name: string, 
    watcher: (value: any, arg: {oldValue?: any, newValue?: any}) => void
): void;
export declare function watch(watchers: {
    [k: string]: (value: any, arg: {oldValue?: any, newValue?: any}) => void
}): void;

export declare function method(name: string, fn: (...args: any) => void): void;
export declare function method(methods: {
    [key: string]: (...args: any) => void;
}): void;

export declare const version: string;
