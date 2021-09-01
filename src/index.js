/**
 * @file San组合式API
*/

import san from 'san';

// 组件的上下文 context，组件创建时候临时使用
let context;
const initContext = () => context = {};

// 存储data的临时对象
let dataCache;

// 渲染相关的临时上下文
let renderingContext = {};

const componentOptions = {
    lifecycleHooks: [
        'compiled',
        'inited',
        'created',
        'attached',
        'detached',
        'disposed',
        'updated'
    ],
    // 组件反解的方法
    reversion: ['el', 'data']
};

/**
 * 通过组合式API定义San组件
 * 
 * @param {Function} creator 通过调用组合式API的方法
 * @param {Object} options 这里传递，无法通过组合式API传递的参数
 * @param {string} [options.el] 组件根元素，不使用 template 渲染视图时使用，组件反解时使用
 * @param {Object} [options.data] 组件数据，组件反解时使用
 * @return {Function} 返回 san.defineComponent 定义的类
*/
export const setupComponent = (creator, options = {}) => {
    // 初始化context上下文
    const context = initContext();

    // 初始化数据
    dataCache = new san.Data({});

    // 执行san组合api
    creator();

    // 使用compiled，尽早把context.dataHandlers中的this的绑定
    if (context.dataManager) {
        const dataManager = context.dataManager;
        const rawData = dataCache.raw;
        const computed = context.computed;
        context.attached = context.attached || [];
        context.attached.push(function () {
            // 初始化数据
            this.data.assign(rawData);
            dataManager.forEach(instance => instance.setData(this.data));

            // 处理computed属性
            Object.keys(computed).forEach(expr => {
                renderingContext.computing = {
                    expr,
                    handler: computed[expr],
                    component: this
                };

                // 执行一次computed方法，保证能收集到computed相关的依赖
                // call(this)，保证原始的this.data.get等相关API兼容
                computed[expr].call(this);
            });
            delete renderingContext.computing;
        });

        delete context.dataManager;
    }

    // 处理watch，尽量在生命周期靠后的阶段执行，注意调用的顺序
    if (context.watch) {
        const watch = context.watch;
        Object.keys(watch).forEach(item => {
            context.attached = context.attached || [];
            context.attached.push(function () {
                this.watch(item, watch[item])
            });
        });
        // 去掉收集的watch参数，否则会引起报错
        delete context.watch;
    }

    // 生命周期方法
    componentOptions.lifecycleHooks.forEach(action => {
        const actionFns = context[action];
        if (actionFns && actionFns.length) {
            context[action] = function () {
                actionFns.forEach(fn => fn.call(this));
            };
        }
    });

    // 组件反解的数据，只能从options中拿到
    componentOptions.reversion.forEach(k => {
        if (options[k]) {
            context[k] = options[k];
        }
    });

    return san.defineComponent(context);
};

/**
 * 处理template方法
*/
export const template = tpl => {
    context.template = tpl;
};


/**
 * 封装this.data的类
 * 
 * @param {string|Array} key
 * @param {Object} dataCenter Data实例
*/
class DataHandler {
    constructor(key, dataCenter) {
        this.key = key;
        this.dataCenter = dataCenter;
    }
    /**
     * 用于把临时存储的数据，挂到组件上面
     * */
    setData(dataCenter) {
        this.dataCenter = dataCenter;
    }

    /**
     * 重写get方法:
     * 1. 支持不传参数：不传参数获取默认key设置的数据
     * const info = data('info', 'san composition api');
     * info.get();  // 'san composition api'
     * 
     * 2. 支持对象形式的设置数据的get
     * const info = data({name: 'jinz', company: 'baidu'})
     * info.get('name') // 'jinz'，等价于 this.data.get('name')
     * 
     * 3. 获取value为对象形式的数据
     * const info = data('info', {name: 'jinz', company: 'baidu'})
     * info.get() // {name: 'jinz', company: 'baidu'}
     * info.get('name') // 'jinz'，等价于: this.data.get('info.name')
     * 
     * **/
    get(key) {
        // 为computed计算属性添加对应的watcher
        if (renderingContext.computing) {
            if (typeof this.key !== 'string' && typeof key !== 'string') {
                // 使用data.get()的情况，不进行watch了
                return;
            }
            const realKey = typeof this.key === 'string'
                ? typeof key === 'string' ? this.key + '.' + key
                    : this.key
                : key;

            if (renderingContext.computing[realKey]) {
                return;
            }

            renderingContext.computing[realKey] = 1;

            const {
                expr,
                handler,
                component
            } = renderingContext.computing;

            component && component.watch(realKey, () => component.data.set(expr, handler.call(component)));
        }

        if (typeof this.key === 'string') {
            return this.dataCenter.get(key ? this.key + '.' + key : this.key);
        }

        if (Array.isArray(this.key)) {
            // data.get()的情况，只返回data api声明的数据，不是全部this.data.get()
            if (!key) {
                const data = this.dataCenter.get();
                const result = {};
                this.key.forEach(k => result[k] = data[k]);
                return result;
            }
            else if (this.key.indexOf(key) > -1) {
                // 不能打没有设置的数据，避免混乱
                return this.dataCenter.get(key);
            }
        }
    }

    /**
     * 重写set方法
     * 
     * 1. 支持直接设置value：
     * const info = data('info', 'sca');
     * info.set({*}item)
     * 
     * 2. 支持批量设置value
     * const info = data('info', {name:'', company: ''});
     * info.set({
     *    name: 'jinz',
     *    company: 'tencent'
     * });
     * 
     * 3. 支持通过2个参数设置：
     * const info = data('info', {name:'', company: ''});
     * info.set('name', 'jinz');
     * 
     * 4. 一些限制？只设置data中存在的项目
     * const info = data({
     *    name: 'jinz',
     *    company: 'tencent'
     * });
     * 
     * info.set('sex', 'male'); // set失败
     * info.get();  // {name: 'jinz', company: 'tencent'}
     * **/
    set(...args) {
        if (args.length === 1) {
            const data = args[0];
            if (typeof this.key === 'string') {
                return this.dataCenter.set(this.key, data);
            }
            // this.key为数组的情况
            if (typeof data === 'object' && !Array.isArray(data)) {
                Object.keys(data).forEach(key => {
                    // TODO: 过滤一遍，只设置data中存在的项目？
                    if (this.key.indexOf(key) > -1) {
                        return this.dataCenter.set(key, data[key]);
                    }
                });
            }
        } else if (args.length > 1) {
            if (typeof this.key === 'string') {
                return this.dataCenter.set(this.key + '.' + args[0], args[1]);
            }
            return this.dataCenter.set(args[0], args[1]);
        }
    }

    // 省略第一个参数的情况
    shorten(method, ...args) {
        if (this.key !== 'string') {
            return;
        }
        let key = this.key;
        if (typeof args[0] === 'string') {
            key = this.key + '.' + args[0];
            args.shift();
        }
        return this.dataCenter[method](key, ...args);
    }

    splice(...args) {
        return this.shorten('splice', ...args);
    }

    apply(...args) {
        return this.shorten('apply', ...args);
    }

    merge(...args) {
        return this.shorten('merge', ...args);
    }

    assign(...args) {
        return this.dataCenter.assign(...args);
    }

    /**
     * 快速设置
     * 
     * data函数提供的方法和this.data方法的对应：
     * remove为例：
     *  this.data.remove({string|Object}expr, {*}item, {Object?}option)
     *  =>
     * const info = data('info', [//...]); 
     * info.remove({*}item, {Object?}option)
     * 
     * 
     * TODO:考虑到参数有冲突的问题，以下方法不支持嵌套对象的key设置
     **/
    quickSet(method, ...args) {
        if (this.key !== 'string') {
            return;
        }
        return this.dataCenter[method](this.key, ...args);
    }

    remove(...args) {
        return this.quickSet('remove', ...args);
    }

    removeAt(...args) {
        return this.quickSet('removeAt', ...args);
    }

    push(...args) {
        return this.quickSet('push', ...args);
    }

    remove(...args) {
        return this.quickSet('remove', ...args);
    }

    pop(...args) {
        return this.quickSet('pop', ...args);
    }

    unshift(...args) {
        return this.quickSet('unshift', ...args);
    }
};

export const data = (key, val) => {
    const obj = typeof key === 'string' ? { [key]: val } : key;
    dataCache.assign(obj);
    const dataKey = typeof key === 'string' ? key : Object.keys(key);
    context.dataManager = context.dataManager || [];
    const dh = new DataHandler(dataKey, dataCache);
    context.dataManager.push(dh);
    return dh;
};


/**
 * 处理生命周期钩子
*/
const setLifecycleHooks = (action, callback) => {
    context[action] = context[action] || [];
    context[action].push(callback);
};

export const onCompiled = callback => {
    return setLifecycleHooks('compiled', callback);
};

export const onInited = callback => {
    return setLifecycleHooks('inited', callback);
};

export const onCreated = callback => {
    return setLifecycleHooks('created', callback);
};

export const onAttached = callback => {
    return setLifecycleHooks('attached', callback);
};

export const onDetached = callback => {
    return setLifecycleHooks('detached', callback);
};

export const onDisposed = callback => {
    return setLifecycleHooks('disposed', callback);
};

export const onUpdated = callback => {
    return setLifecycleHooks('updated', callback);
};

/**
 * 处理static option对应的API
*/
const setStaticOption = (method, key, val) => {
    // 参数可以是key、val两个参数，也可以是对象的形式
    const obj = typeof key === 'string' ? { [key]: val } : key;
    context[method] = context[method] || {};
    Object.assign(context[method], obj);
};


export const filters = (...args) => {
    return setStaticOption('filters', ...args);
};

export const computed = (...args) => {
    return setStaticOption('computed', ...args);
};

export const messages = (...args) => {
    return setStaticOption('messages', ...args);
};

export const components = (...args) => {
    return setStaticOption('components', ...args);
};

export const watch = (...args) => {
    return setStaticOption('watch', ...args);
};

/**
 * 为组件添加方法
 * 参数可以是key、val两个参数，也可以是对象的形式
 * 
 * @param {string|Object} name 数据的key，或者键值对 
 * @param {Function} handler 添加的函数 
*/
export const method = (name, handler) => {
    const obj = typeof name === 'string' ? { [name]: handler } : name;
    Object.assign(context, obj);
};
