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
    method: 'method',
    basicOptions: [
        'computed',
        'messages',
        'filters',
        'components'
    ],
    lifecycleHooks: [
        'compiled',
        'inited',
        'created',
        'attached',
        'detached',
        'disposed',
        'updated'
    ],
    watch: 'watch',

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
        context.attached.push(function() {
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
                // 兼容，this.data.get
                computed[expr].call({
                    data: {
                        get() {},
                        set() {}
                    }
                });
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
            context.attached.push(function() {
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
            context[action] = function() {
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
exports.template = tpl => {
    context.template = tpl;
};


/**
 * 封装this.data的类
 * 
 * @param {string|Array} key
 * @param {Object} dataCenter Data实例
*/
function DataHandler(key, dataCenter) {
    this.key = key;
    this.dataCenter = dataCenter;
};

/**
 * 用于把临时存储的数据，挂到组件上面
*/
DataHandler.prototype.setData = function(dataCenter) {
    this.dataCenter = dataCenter;
};

/**
 * 重写get方法
 * **/ 
DataHandler.prototype.get = function(key) {
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
};

/**
 * 重写set方法
 * 
 * info.set('jinz');
 * 
 * info.set({
 *    name: 'jinz',
 *    company: 'tencent'
 * });
 * 
 * info.set('name', 'jinz');
 * 
 * TODO: 补充一些错误log
 * **/
DataHandler.prototype.set = function(...args) {
    if (args.length === 1) {
        const data = args[0];
        if (typeof this.key === 'string') {
            return this.dataCenter.set(this.key, data);
        }
        // this.key为数组的情况
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.keys(data).forEach(key => {
                // 过滤一遍，只设置data中存在的项目
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
};


// 复用this.data.xxx，第一个参数可以省略的情况
['splice', 'apply', 'merge'].forEach(method => {
    DataHandler.prototype[method] = function(...args) {
        if (this.key !== 'string') {
            return;
        }
        let key = this.key;
        if (typeof args[0] === 'string') {
            key = this.key + '.' + args[0];
            args.shift();
        }
        return this.dataCenter[method](key, ...args);
    };
});

// 复用this.data.assign
DataHandler.prototype.assign = function(...args) {
    return this.dataCenter.assign(...args);
};



/**
 * TODO:考虑到参数有冲突的问题，一下方法不支持嵌套对象的key设置
 * 例如：this.data.remove({string|Object}expr, {*}item, {Object?}option)
 *      => data.remove({*}item, {Object?}option)
 **/ 
[
    'remove',
    'removeAt',
    'push',
    'pop',
    'unshift',
    'shift'
].forEach(method => {
    DataHandler.prototype[method] = function(...args) {
        if (this.key !== 'string') {
            return;
        }
        return this.dataCenter[method](this.key, ...args);
    };
});

exports.data = (key, val) => {
    const obj = typeof key === 'string' ? {[key]: val} : key;
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
componentOptions.lifecycleHooks.forEach(action => {
    const onAction = 'on' + action.replace(/\w/, w => w.toUpperCase());
    exports[onAction] = callback => {
        context[action] = context[action] || [];
        context[action].push(callback);
    };
});

/**
 * 处理static option对应的API
*/
componentOptions.basicOptions.concat(componentOptions.watch).forEach(item => {
    exports[item] = (key, val) => {
        // 参数可以是key、val两个参数，也可以是对象的形式
        const obj = typeof key === 'string' ? {[key]: val} : key;
        context[item] = context[item] || {};
        Object.assign(context[item], obj);
    };
});

/**
 * 为组件添加方法
 * 参数可以是key、val两个参数，也可以是对象的形式
 * 
 * @param {string|Object} name 数据的key，或者键值对 
 * @param {Function} handler 添加的函数 
*/
exports.method = (name, handler) => {
    const obj = typeof name === 'string' ? {[name]: handler} : name;
    Object.assign(context, obj);
};
