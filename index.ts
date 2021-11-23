/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file San组合式API
 */

interface DataObj {
    [key: string]: any;
}

type Creator = (context?: DataObj) => void;
interface Context {
    creator?: Creator;
    template?: string;
    initData?: DataObj;
    computed?: DataObj;
    computedDatas?: DataObj;
    instance?: DataObj;
    filters?: DataObj;
    components?: DataObj;
};


type FunctionVar = (...args: any) => any;
interface ClassMemberCreator {
    (name: string, value: FunctionVar): void;
    (value: {[key: string]: FunctionVar}): void;
}

interface SpliceArgs {
    [index: number]: any;
    0: number;
    1?: number;
}

/**
 * 用于定义组件数据的临时对象
 */
let context: Context;

/**
 * 用于存储多个context
 */
let contexts: Context[] = [];

export const version = '__VERSION__';

function componentInitData(this: any): DataObj {
    return this.__scContext.initData;
}

/**
 * 组件生命周期钩子
 * @type {Array}
 */
const LIFECYCLE_HOOKS = [
    'construct',
    'compiled',
    'inited',
    'created',
    'attached',
    'detached',
    'disposed',
    'updated',
    'error'
];

function componentInitLifeCycle(this: any) {
    LIFECYCLE_HOOKS.forEach((lifeCycle: string) => {
        const hooks = this.__scContext[lifeCycle];
        if (hooks) {
            let len = hooks.length;
            this[lifeCycle] = function (...args: any) {
                for (let i = 0; i < len; i++) {
                    hooks[i].apply(this, args);
                }
            };
        }
    });
}

function getComputedWatcher(name: string, fn: FunctionVar) {
    return function (this: any) {
        let value = fn.call(this);
        this.data.set(name, value);
    };
}

function componentInitComputed(this: any) {
    let computed = this.__scContext.computed;
    if (computed) {
        let names = Object.keys(computed);
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let fn = computed[name];

            let computedDatas: string | any[] = [];
            this.__scContext.computedDatas = computedDatas;
            let watcher = getComputedWatcher(name, fn);
            watcher.call(this);

            for (let j = 0; j < computedDatas.length; j++) {
                this.watch(computedDatas[j], watcher);
            }

            this.__scContext.computedDatas = null;
        }
    }
}

function componentInitWatch(this: any) {
    let watches = this.__scContext.instance.watches;
    if (watches) {
        let names = Object.keys(watches);
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            this.watch(name, watches[name].bind(this.__scContext.instance));
        }
    }
}

/**
 * 通过组合式API定义San组件，返回组件类
 */
export function defineComponent(creator: Creator, san: {[key: string]: any, Component: FunctionVar}): FunctionVar {
    let defineContext: Context = {
        creator: creator
    };
    context = defineContext;
    contexts.push(context);

    // 执行san组合api
    creator();

    // 重置 context
    contexts.pop();
    context = contexts[contexts.length - 1];

    const ComponentClass = function (this: any, options: any) {
        this.__scContext = {
            instance: this,
            inited: [
                componentInitComputed
            ],
            attached: [
                componentInitWatch
            ]
        };
        context = this.__scContext;
        contexts.push(context);

        // 重新赋值，改变下 this
        let creatorAsInstance = defineContext.creator as Creator;
        creatorAsInstance();

        contexts.pop();
        context = contexts[contexts.length - 1];

        this.__scInitLifeCycle();

        san.Component.call(this, options);
    };

    function Empty() {}
    Empty.prototype = san.Component.prototype;
    ComponentClass.prototype = new (Empty as any)();
    ComponentClass.prototype.constructor = ComponentClass;

    ComponentClass.prototype.initData = componentInitData;
    ComponentClass.prototype.__scInitLifeCycle = componentInitLifeCycle;

    const disposeMethod = san.Component.prototype.dispose;

    ComponentClass.prototype.dispose = function (noDetach: any, noTransition: any) {
        this.__scContext = null;
        disposeMethod.call(this, noDetach, noTransition);
    };


    if (defineContext.template) {
        ComponentClass.prototype.template = defineContext.template;
    }

    if (defineContext.filters) {
        ComponentClass.prototype.filters = defineContext.filters;
    }

    if (defineContext.components) {
        ComponentClass.prototype.components = defineContext.components;
    }

    return ComponentClass;
};


/**
 * 定义组件的 template
 */
export function template(tpl: string): void;

// 使用 Tagged Template String 的形式定义组件的 template
export function template(tpl: TemplateStringsArray, ...args: string[]): void;
export function template(tpl: string | TemplateStringsArray) {
    if (context.creator) {
        if (tpl instanceof Array) {
            let realTpl: string = tpl[0];
            for (let i = 1, l = tpl.length; i < l; i++) {
                realTpl += arguments[i] as string + tpl[i];
            }
            context.template = realTpl;
        }
        else {
            context.template = tpl;
        }
    }
};

/**
 * 组件数据的代理类
 * @class DataProxy
 */
class DataProxy {
    name: string;
    instance: {[key: string]: any};
    /**
     * 组件数据的代理类
     *
     * @param {string|Array} name 数据的key，如果是通过键值对声明的数据，则name是一个数组
     */
    constructor(name: string) {
        this.name = name;
        this.instance = context.instance as object;
    }

    /**
     * get方法获取定义的的数据
     */
    get(name?: string): any {
        let fullName = name ? this._resolveName(name) : this.name;

        let computedDatas = this.instance.__scContext.computedDatas;
        if (computedDatas) {
            computedDatas.push(fullName);
        }

        return this.instance.data.get(fullName);
    }

    /**
     * 更新数据
     */
    set(value: any): void;
    set(name: string, value?: any): void;
    set(nameOrValue: string | any, value?: any): void {
        if (typeof value === 'undefined') {
            this.instance.data.set(this.name, nameOrValue);
        }
        else {
            this.instance.data.set(this._resolveName(nameOrValue), value);
        }
    }

    /**
     * 将传入数据对象（source）与 data 合并，进行批量更新
     * 作用类似于 JavaScript 中的 Object.assign
     */
    merge(source: DataObj): void;
    merge(name: string, source: DataObj): void;
    merge(nameOrSource: string | DataObj, source?: DataObj) {
        if (source) {
            this.instance.data.merge(this._resolveName(nameOrSource as string), source);
        }
        else {
            this.instance.data.merge(this.name, nameOrSource);
        }
    }

    apply(name: string, fn: FunctionVar): void;
    apply(fn: FunctionVar): void;
    apply(nameOrFn: string | FunctionVar, fn?: FunctionVar) {
        if (fn) {
            this.instance.data.apply(this._resolveName(nameOrFn as string), fn);
        }
        else {
            this.instance.data.apply(this.name, nameOrFn);
        }
    }

    push(name: string, item: any): number;
    push(item: any): number;
    push(nameOrItem: string | any, item?: any): number {
        if (typeof item === 'undefined') {
            return this.instance.data.push(this.name, nameOrItem);
        }

        return this.instance.data.push(this._resolveName(nameOrItem as string), item);
    }

    pop(name?: string) {
        if (typeof name === 'string') {
            return this.instance.data.pop(this._resolveName(name));
        }

        return this.instance.data.pop(this.name);
    }

    shift(name?: string): number {
        if (typeof name === 'string') {
            return this.instance.data.shift(this._resolveName(name));
        }

        return this.instance.data.shift(this.name);
    }

    unshift(name: string, item: any): number;
    unshift(item: any): number;
    unshift(nameOrItem: string | any, item?: any): number {
        if (typeof item === 'undefined') {
            return this.instance.data.unshift(this.name, nameOrItem);
        }

        return this.instance.data.unshift(this._resolveName(nameOrItem as string), item);
    }

    remove(name: string, item: any): void;
    remove(item: any): void;
    remove(nameOrItem: string | any, item?: any) {
        if (typeof item === 'undefined') {
            return this.instance.data.remove(this.name, nameOrItem);
        }

        return this.instance.data.remove(this._resolveName(nameOrItem as string), item);
    }

    removeAt(index: number): void;
    removeAt(name: string, index: number): void;
    removeAt(nameOrIndex: string | number, index?: number) {
        if (typeof index === 'undefined') {
            return this.instance.data.removeAt(this.name, nameOrIndex);
        }

        return this.instance.data.removeAt(this._resolveName(nameOrIndex as string), index);
    }

    splice(name: string, args: SpliceArgs): void;
    splice(args: SpliceArgs): void;
    splice(nameOrArgs: string | SpliceArgs, args?: SpliceArgs) {
        if (typeof args === 'undefined') {
            return this.instance.data.splice(this.name, nameOrArgs);
        }
        return this.instance.data.splice(this._resolveName(nameOrArgs as string), args);
    }

    /**
     * 将传入的数据项附加 this.name，转换成实际数据项
     */
    _resolveName(name: string): string {
        return this.name + (/^[\[.]/.test(name) ? name : '.' + name);
    }
}

/**
 * 定义组件数据，返回的 DataProxy 实例支持get、set等数据操作方法
 */
export function data(key: string, value: any) {
    if (typeof key !== 'string') {
        return;
    }

    if (context.creator) {
        return;
    }

    if (!context.initData) {
        context.initData = {};
    }

    context.initData[key] = value;
    return new DataProxy(key);
};

class ComputedProxy {
    name: string;
    instance: {[key: string]: any};
    constructor(name: string) {
        this.name = name;
        this.instance = context.instance as object;
    }

    get() {
        let computedDatas = this.instance.__scContext.computedDatas;
        if (computedDatas) {
            computedDatas.push(this.name);
        }
        return this.instance.data.get(this.name);
    }
}

/**
 * 定义组件计算数据，返回的 ComputedProxy 提供 get 方法
 */
export function computed(name: string, fn: FunctionVar) {
    if (typeof name !== 'string') {
        return;
    }

    if (context.creator) {
        return;
    }

    if (!context.computed) {
        context.computed = {};
    }

    context.computed[name] = fn;
    return new ComputedProxy(name);
}


/**
 * 创建组件类成员API的高阶函数，
 * 负责：filters、computed、messages、components、watch等API创建
 *
 * @param {string} memberName 类成员名称
 * @returns {Function}
 */
function classMemberCreator(memberName: string): ClassMemberCreator {
    /**
     * 创建组件属性API方法
     * 参数可以是key、val两个参数，也可以是对象的形式
     */

    return function <T extends {[key: string]: FunctionVar}> (name: string | T, value?: FunctionVar) {
        if (context.creator) {
            context[memberName] = context[memberName] || {};

            switch (typeof name) {
                case 'string':
                    context[memberName][name] = value;
                    break;

                case 'object':
                    Object.assign(context[memberName], name);
            }
        }
    };
}

export const filters = classMemberCreator('filters');
export const components = classMemberCreator('components');

/**
 * 创建生命周期钩子方法的高阶函数
 *
 * @param {string} name 生命周期钩子名称，inited, attached...等
 * @returns {Function}
 */
function hookMethodCreator(name: string) {
    /**
     * 创建生命周期钩子方法的函数
     *
     * @param {Function} handler 生命周期钩子，回调方法
     */
    return function (handler: FunctionVar) {
        if (context.creator) {
            return;
        }
        context[name] = context[name] || [];
        context[name].push(handler);
    };
}

export const onConstruct = hookMethodCreator('construct');
export const onCompiled = hookMethodCreator('compiled');
export const onInited = hookMethodCreator('inited');
export const onCreated = hookMethodCreator('created');
export const onAttached = hookMethodCreator('attached');
export const onDetached = hookMethodCreator('detached');
export const onDisposed = hookMethodCreator('disposed');
export const onUpdated = hookMethodCreator('updated');
export const onError = hookMethodCreator('error');

/**
 * 创建组件实例成员API的高阶函数，
 * 负责：computed、messages、watch等API创建
 *
 * @param {string} memberName
 * @returns {Function}
 */
function instanceMemberCreator(memberName: string): FunctionVar {
    /**
     * 创建组件属性API方法
     * 参数可以是key、val两个参数，也可以是对象的形式
     *
     * @param {string|Object} name 数据的key，或者键值对
     * @param {Function} handler 添加的函数
     */
    return function (name: string | object, fn: FunctionVar) {
        if (context.creator) {
            return;
        }

        let instance = context.instance as object;
        let target = instance[memberName];
        if (!instance.hasOwnProperty(memberName)) {
            target = instance[memberName] = {};
        }

        switch (typeof name) {
            case 'string':
                target[name] = fn;
                break;

            case 'object':
                Object.assign(target, name);
        }
    };
}

export const messages = instanceMemberCreator('messages');
export const watch = instanceMemberCreator('watches');

/**
 * 定义组件的方法
 */
export function method(name: string, fn: FunctionVar): void;
export function method<T extends {[key: string]: FunctionVar}>(name: T): void;
export function method<T extends {[key: string]: FunctionVar}>(name: string | T, fn?: FunctionVar) {
    if (context.creator) {
        return;
    }

    switch (typeof name) {
        case 'string':
            (context.instance as object)[name] = fn;
            break;

        case 'object':
            Object.assign(context.instance, name);
    }
}
