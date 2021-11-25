interface DataObj {
    [key: string]: any;
}
declare type Creator = (context?: DataObj) => void;
declare type TFunction = (...args: any) => any;
declare type NFunction = (...args: any) => void;
interface ClassMemberCreator {
    (name: string, value: NFunction): void;
    (value: {
        [key: string]: NFunction;
    }): void;
}
interface SpliceArgs {
    [index: number]: any;
    0: number;
    1?: number;
}

export declare const version: string;
export declare function defineComponent(creator: Creator, san: any): NFunction;


export declare function template(tpl: string): void;
export declare function template(tpl: TemplateStringsArray, ...args: string[]): void;

declare class DataProxy {
    name: string;
    instance: {
        [key: string]: any;
    };

    constructor(name: string);

    get(name?: string): any;

    set(value: any): void;
    set(name: string, value?: any): void;

    merge(source: DataObj): void;
    merge(name: string, source: DataObj): void;

    apply(name: string, fn: TFunction): void;
    apply(fn: TFunction): void;

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

    _resolveName(name: string): string;
}

export declare function data(key: string, value: any): DataProxy | undefined;
declare class ComputedProxy {
    name: string;
    instance: {
        [key: string]: any;
    };
    constructor(name: string);
    get(): any;
}

export declare function computed(name: string, fn: TFunction): ComputedProxy | undefined;
export declare const filters: ClassMemberCreator;
export declare const components: ClassMemberCreator;
export declare const onConstruct: (handler: NFunction) => void;
export declare const onCompiled: (handler: NFunction) => void;
export declare const onInited: (handler: NFunction) => void;
export declare const onCreated: (handler: NFunction) => void;
export declare const onAttached: (handler: NFunction) => void;
export declare const onDetached: (handler: NFunction) => void;
export declare const onDisposed: (handler: NFunction) => void;
export declare const onUpdated: (handler: NFunction) => void;
export declare const onError: (handler: NFunction) => void;
export declare const messages: NFunction;
export declare const watch: NFunction;

export declare function method(name: string, fn: NFunction): void;
export declare function method<T extends {
    [key: string]: NFunction;
}>(name: T): void;
