/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file San组合式API
 */


export const version = '__VERSION__';

/**
 * 用于定义组件数据的临时对象
 * @type {Object?}
 */
let context;

/**
 * 用于存储多个context
 * @type {Array}
 */
let contexts = [];


function componentInitData() {
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

function componentInitLifeCycle() {
    LIFECYCLE_HOOKS.forEach(lifeCycle => {
        const hooks = this.__scContext[lifeCycle];
        if (hooks) {
            let len = hooks.length;
            this[lifeCycle] = function (...args) {
                for (let i = 0; i < len; i++) {
                    hooks[i].apply(this, args);
                }
            };
        }
    });
}

function componentInitComputed() {
    let computed = this.__scContext.computed;
    if (computed) {
        let names = Object.keys(computed);
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let fn = computed[name];

            let computedDatas = [];
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

function componentInitWatch() {
    let watches = this.__scContext && this.__scContext.watches;

    if (watches) {
        let component = this.__scContext.component;

        let names = Object.keys(watches);
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            this.watch(name, watches[name].bind(component));
        }
    }
}

function componentCleanOnDisposed() {
    if (this.__scContext) {
        this.__scContext.publicContext.dispose();
        this.__scContext = null;
    }
}

function getComputedWatcher(name, fn) {
    return function () {
        let value = fn.call(this);
        this.data.set(name, value);
    };
}

/**
 * 处理template方法
 *
 * @param {string} tpl 组件的模板，支持tagged template string
 */
export function template(tpl) {
    if (context.creator) {
        if (tpl instanceof Array) {
            let realTpl = tpl[0];
            for (let i = 1, l = tpl.length; i < l; i++) {
                realTpl += arguments[i] + tpl[i];
            }
            context.template = realTpl;
        }
        else {
            context.template = tpl;
        }
    }
};

/**
 * template配置项
 *
 * @param {Object} 组件的模板配置项，包括：trimWhitespace、delimiters、autoFillStyleAndId
 */
export function templateOptions({trimWhitespace, delimiters, autoFillStyleAndId}) {
    if (context.creator) {
        context.trimWhitespace = trimWhitespace;
        context.delimiters = delimiters;
        context.autoFillStyleAndId = autoFillStyleAndId;
    }
};

/**
 * 组件数据的代理类
 * @class DataProxy
 */
class DataProxy {
    /**
     * 组件数据的代理类
     *
     * @param {string|Array} name 数据的key，如果是通过键值对声明的数据，则name是一个数组
     */
    constructor(name, component) {
        this.name = name;
        this.component = component;
    }

    /**
     * get方法
     *
     * 1. const info = data('info', 'san composition api');
     * info.get();  // 'san composition api'
     *
     * 2. 获取value为对象形式的数据
     * const info = data('info', {name: 'jinz', company: 'baidu'})
     * info.get() // {name: 'jinz', company: 'baidu'}
     * info.get('name') // 'jinz'，等价于: this.data.get('info.name')
     *
     * @param {string?} name 获取 data 方法设置的数据的 名称
     */
    get(name) {
        let fullName = name ? this._resolveName(name) : this.name;

        let scContext = this.component.__scContext;
        let computedDatas = scContext && scContext.computedDatas;
        if (computedDatas) {
            computedDatas.push(fullName);
        }

        return this.component.data.get(fullName);
    }

    /**
     * set的用法
     *
     * 1. const info = data('info', 'san composition api');
     * info.set('sca');
     * info.get();  // 'sca'
     *
     * 2. 设置value为对象形式的数据
     * const info = data('info', {name: 'jinz', company: 'baidu'})
     * info.set('name', 'erik') // 'jinz'，等价于: this.data.set('info.name', 'erik')
     *
     * 支持2种参数形式
     */
    set(nameOrValue, value) {
        if (typeof value === 'undefined') {
            this.component.data.set(this.name, nameOrValue);
        }
        else {
            this.component.data.set(this._resolveName(nameOrValue), value);
        }
    }

    /**
     * 将传入数据对象（source）与 data 合并，进行批量更新
     * 作用类似于 JavaScript 中的 Object.assign
     *
     * @param {string|Object} nameOrSource
     * @param {Object?} source
     */
    merge(nameOrSource, source) {
        if (source) {
            this.component.data.merge(this._resolveName(nameOrSource), source);
        }
        else {
            this.component.data.merge(this.name, nameOrSource);
        }
    }

    apply(nameOrFn, fn) {
        if (fn) {
            this.component.data.apply(this._resolveName(nameOrFn), fn);
        }
        else {
            this.component.data.apply(this.name, nameOrFn);
        }
    }

    push(nameOrItem, item) {
        if (typeof item === 'undefined') {
            return this.component.data.push(this.name, nameOrItem);
        }

        return this.component.data.push(this._resolveName(nameOrItem), item);
    }

    pop(name) {
        if (typeof name === 'string') {
            return this.component.data.pop(this._resolveName(name));
        }

        return this.component.data.pop(this.name);
    }

    shift(name) {
        if (typeof name === 'string') {
            return this.component.data.shift(this._resolveName(name));
        }

        return this.component.data.shift(this.name);
    }

    unshift(nameOrItem, item) {
        if (typeof item === 'undefined') {
            return this.component.data.unshift(this.name, nameOrItem);
        }

        return this.component.data.unshift(this._resolveName(nameOrItem), item);
    }

    remove(nameOrItem, item) {
        if (typeof item === 'undefined') {
            return this.component.data.remove(this.name, nameOrItem);
        }

        return this.component.data.remove(this._resolveName(nameOrItem), item);
    }

    removeAt(nameOrIndex, index) {
        if (typeof index === 'undefined') {
            return this.component.data.removeAt(this.name, nameOrIndex);
        }

        return this.component.data.removeAt(this._resolveName(nameOrIndex), index);
    }

    splice(nameOrArgs, args) {
        if (typeof args === 'undefined') {
            return this.component.data.splice(this.name, nameOrArgs);
        }

        return this.component.data.splice(this._resolveName(nameOrArgs), args);
    }

    /**
     * 将传入的数据项附加 this.name，转换成实际数据项
     *
     * @private
     * @param {string} name
     * @return {string}
     */
    _resolveName(name) {
        return this.name + (/^[\[.]/.test(name) ? name : '.' + name);
    }
}


/**
 * 操作数据的API，提供 get 和 set 方法
 *
 * @param {string} name 数据的名称
 * @param {*} value 初始值
 * @returns {Object} 返回一个带有包装有 this.data 相关数据操作API的对象
 */
export function data(name, value) {
    if (context.creator) {
        return;
    }

    if (typeof name !== 'string') {
        return;
    }

    if (!context.initData) {
        context.initData = {};
    }

    context.initData[name] = value;

    let dataDefs = context.publicContext._dataDefs;
    if (dataDefs[name]) {
        return dataDefs[name];
    }

    return (dataDefs[name] = new DataProxy(name, context.component));
};

class ComputedProxy {
    constructor(name, component) {
        this.name = name;
        this.component = component;
    }

    get() {
        let scContext = this.component.__scContext;
        let computedDatas = scContext && scContext.computedDatas;
        if (computedDatas) {
            computedDatas.push(this.name);
        }

        return this.component.data.get(this.name);
    }
}

export function computed(name, fn) {
    if (context.creator) {
        return;
    }

    if (typeof name !== 'string') {
        return;
    }

    if (!context.computed) {
        context.computed = {};
    }

    context.computed[name] = fn;

    return new ComputedProxy(name, context.component);
}


/**
 * 创建组件类成员API的高阶函数，
 * 负责：filters/components API创建
 *
 * @param {string} memberName 类成员名称
 * @returns {Function}
 */
function classMemberCreator(memberName) {
    /**
     * 创建组件属性API方法
     * 参数可以是key、val两个参数，也可以是对象的形式
     *
     * @param {string|Object} name 数据的key，或者键值对
     * @param {Function} handler 添加的函数
     */
    return function (name, value) {
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
function hookMethodCreator(name) {
    /**
     * 创建生命周期钩子方法的函数
     *
     * @param {Function} handler 生命周期钩子，回调方法
     */
    return function (handler) {
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


export function messages(name, value) {
    if (context.creator) {
        return;
    }

    let component = context.component;
    switch (typeof name) {
        case 'string':
            if (!component.messages) {
                component.messages = {};
            }
            component.messages[name] = value;
            break;

        case 'object':
            if (!component.messages) {
                component.messages = name;
            }
            else {
                Object.assign(component.messages, name);
            }
    }
}

export function watch(name, value) {
    if (context.creator) {
        return;
    }

    if (!context.watches) {
        context.watches = {};
    }

    switch (typeof name) {
        case 'string':
            context.watches[name] = value;
            break;

        case 'object':
            Object.assign(context.watches, name);
    }
}


/**
 * 为组件添加方法
 * 参数可以是key、val两个参数，也可以是对象的形式
 *
 * @param {string|Object} name 数据的key，或者键值对
 * @param {Function} handler 添加的函数
 */
export function method(name, value) {
    if (context.creator) {
        return;
    }

    switch (typeof name) {
        case 'string':
            context.component[name] = value;
            break;

        case 'object':
            Object.assign(context.component, name);
    }
}


class PublicComponentContext {
    constructor(component) {
        this.component = component;
        this._dataDefs = {};
    }

    data(name) {
        let dataProxy = this._dataDefs[name];
        if (!dataProxy) {
            dataProxy = this._dataDefs[name] = new DataProxy(name, this.component);
        }

        return dataProxy;
    }

    dispatch(name, value) {
        if (this.component) {
            this.component.dispatch(name, value);
        }
    }

    fire(name, event) {
        if (this.component) {
            this.component.fire(name, event);
        }
    }

    ref(name) {
        if (this.component) {
            return this.component.ref(name);
        }
    }

    nextTick(fn, thisArg) {
        if (this.component) {
            this.component.nextTick(fn, thisArg);
        }
    }

    dispose() {
        this.component = null;
    }
}


/**
 * 通过组合式API定义San组件
 *
 * @param {Function} creator 通过调用组合式API的方法
 * @param {Object} san
 * @return {Function} 返回 san.defineComponent 定义的类
 */
export function defineComponent(creator, san) {
    let defineContext = {
        creator: creator
    };
    context = defineContext;
    contexts.push(context);

    // 执行san组合api
    creator();

    // 重置 context
    contexts.pop();
    context = contexts[contexts.length - 1];

    const ComponentClass = function (options) {
        this.__scContext = {
            component: this,
            publicContext: new PublicComponentContext(this),
            inited: [componentInitComputed],
            attached: [componentInitWatch]
        };

        context = this.__scContext;
        contexts.push(context);

        let creatorAsInstance = defineContext.creator;
        creatorAsInstance(context.publicContext);

        contexts.pop();
        context = contexts[contexts.length - 1];

        if (this.__scContext.disposed) {
            this.__scContext.disposed.push(componentCleanOnDisposed);
        }
        else {
            this.__scContext.disposed = [componentCleanOnDisposed];
        }

        this.__scInitLifeCycle();

        san.Component.call(this, options);
    };


    function Empty() {}
    Empty.prototype = san.Component.prototype;
    ComponentClass.prototype = new Empty();
    ComponentClass.prototype.constructor = ComponentClass;

    ComponentClass.prototype.initData = componentInitData;
    ComponentClass.prototype.__scInitLifeCycle = componentInitLifeCycle;


    if (defineContext.template) {
        ComponentClass.prototype.template = defineContext.template;
    }

    if (defineContext.filters) {
        ComponentClass.prototype.filters = defineContext.filters;
    }

    if (defineContext.components) {
        ComponentClass.prototype.components = defineContext.components;
    }

    if (defineContext.trimWhitespace != null) {
        ComponentClass.prototype.trimWhitespace = defineContext.trimWhitespace;
    }

    if (defineContext.delimiters != null) {
        ComponentClass.prototype.delimiters = defineContext.delimiters;
    }

    if (defineContext.autoFillStyleAndId != null) {
        ComponentClass.prototype.autoFillStyleAndId = defineContext.autoFillStyleAndId;
    }

    return ComponentClass;
};
