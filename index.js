/**
 * @file San组合式API
*/

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

/**
 * 存储组件data的临时变量
 * @type {Object?}
 */
let dataCache;

/**
 * 在组件渲染期间临时上下文对象
 * @type {Object?}
 */
let renderingContext = {};

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


/**
 * 通过组合式API定义San组件
 *
 * @param {Function} creator 通过调用组合式API的方法
 * @param {Object} san
 * @return {Function} 返回 san.defineComponent 定义的类
*/
export const defineComponent = (creator, san) => {
    let defineOptions = {};

    let watches = {};

    let data = {};

    // 初始化context上下文
    if (context) {
        // 如果上一个context存在，说明组件的定义尚未完成
        contexts.push(context);
    }

    context = {
        methods: defineOptions,
        watches,
        data
    };

    // 初始化数据
    // TODO: dont new Data
    dataCache = new san.Data({});

    // 执行san组合api
    creator();

    // 使用compiled，尽早把context.dataHandlers中的this的绑定
    if (context.dataManager) {
        const dataManager = context.dataManager;
        const rawData = dataCache.raw;
        defineOptions.initData = () => rawData;

        const computed = context.computed;
        context.inited = context.inited || [];
        context.inited.unshift(function () {
            // 将data API的方法挂载到组件上
            dataManager.forEach(dataHandler => dataHandler.setData(this.data));
            // 处理computed属性
            if (computed) {
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
            }
        });
    }

    // 处理watch，尽量在生命周期靠后的阶段执行，注意调用的顺序
    const watchKeys = Object.keys(watches);
    if (watchKeys.length) {
        context.attached = context.attached || [];
        context.attached.push(function () {
            watchKeys.forEach(key => {
                this.watch(key, watches[key].bind(this));
            });
        });
    }

    // 生命周期方法
    LIFECYCLE_HOOKS.forEach(lifeCycle => {
        const hooks = context[lifeCycle];
        if (hooks) {
            let len = hooks.length;
            defineOptions[lifeCycle] = function (...args) {
                for (let i = 0; i < len; i++) {
                    hooks[i].apply(this, args);
                }
            };
        }
    });

    // 将能透传的一些属性直接赋值
    if (context.template) {
        defineOptions.template = context.template;
    }

    if (context.computed) {
        defineOptions.computed = context.computed;
    }

    if (context.messages) {
        defineOptions.messages = context.messages;
    }

    if (context.filters) {
        defineOptions.filters = context.filters;
    }

    if (context.components) {
        defineOptions.components = context.components;
    }

    // 重置 context
    context = contexts.pop();

    return san.defineComponent(defineOptions);
};

/**
 * 处理template方法
 *
 * @param {string} tpl 组件的模板
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
     *
     * @param {Object} dataCenter Data实例
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
     * @param {string?} key 获取data()设置数据的key
     * * */
    get(key) {
        // 为computed计算属性添加对应的watcher
        if (renderingContext.computing) {
            const {
                expr,
                handler,
                component
            } = renderingContext.computing;

            if (typeof this.key !== 'string' && typeof key !== 'string') {
                // 使用data.get()的情况
                this.key.forEach(key => {
                    component && component.watch(key, () => component.data.set(expr, handler.call(component)));
                });
            }
            else {
                const realKey = typeof this.key === 'string'
                    ? typeof key === 'string' ? this.key + '.' + key
                        : this.key
                    : key;

                component && component.watch(realKey, () => component.data.set(expr, handler.call(component)));
            }
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
            // 不能拿没有设置的数据，避免混乱，考虑 a.b, a[0]的情况
            const realKey = key.split(/[.[]/)[0];
            if (this.key.indexOf(realKey) > -1) {
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
     *
     */
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

    /**
     * 当this.data下的原始方法的第一个参数不为string的情况，可以省略第一个参数
     *
     * 两种情况：
     * const someData = data('someData', [...]);
     *
     * 1. someData.splice([1, 1]);
     *  等价于： this.data.splice('someData', [1, 1]);
     *
     * 2. someData.splice('list', [1, 1]);
     * 等价于： this.data.splice('someData.list', [1, 1]);
     *
     * 3. 批量设置的key，是需要传参数的
     * const someData = data({
     *     name: 'dataList',
     *     list: []
     * });
     * someData.splice('list', [1, 1]);
     *
     * @param {string} method 要设置的方法
     * @param {Array} args 参数透传
    */
    shorten(method, ...args) {
        let key = this.key;

        if (typeof key !== 'string') {
            key = '';
        }

        if (typeof args[0] === 'string') {
            key = key ? (key + '.') + args[0] : args[0];
            args.shift();
        }

        return key && this.dataCenter[method](key, ...args);
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

    removeAt(...args) {
        return this.shorten('removeAt', ...args);
    }

    pop(...args) {
        return this.shorten('pop', ...args);
    }

    assign(...args) {
        return this.dataCenter.assign(...args);
    }

    /**
     * 快速设置
     *
     * 对于一些数组的方法，参数可能为string，如果直接用shorten方法进行设置，可能存在两种歧义，例如：
     * const myData = data(...);
     *
     * myData.remove('list', 'news');
     *
     * 语义1：this.data.remove('myData', 'list');
     * 语义2：this.data.remove('myData.list', 'news');
     *
     * 这种情况下，根据语义环境来判断：
     *
     * data函数提供的方法和this.data方法的对应：
     * remove为例：
     *  this.data.remove({string|Object}expr, {*}item, {Object?}option)
     *  =>
     * const info = data('info', [//...]);
     * info.remove({*}item, {Object?}option)
     *
     * @param {string} method 要设置的方法
     * @param {Array} args 参数透传
     * */
    quickSet(method, ...args) {
        let key = '';
        if (typeof this.key === 'string') {
            if (Array.isArray(this.dataCenter.get(this.key))) {
                key = this.key;
            }
            else if (typeof args[0] === 'string') {
                if (Array.isArray(this.dataCenter.get(this.key + '.' + args[0]))) {
                    key = this.key + '.' + args[0];
                    args.shift();
                }
            }
        }
        else if (typeof args[0] === 'string') {
            if (Array.isArray(this.dataCenter.get(args[0]))) {
                key = args[0];
                args.shift();
            }
        }

        return key && this.dataCenter[method](key, ...args);
    }

    remove(...args) {
        return this.quickSet('remove', ...args);
    }

    push(...args) {
        return this.quickSet('push', ...args);
    }

    unshift(...args) {
        return this.quickSet('unshift', ...args);
    }
};

/**
 * 操作数据的API
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
 * @param {string|Object} key 数据的key，或者键值对
 * @param {*} val 设置的数据
 * @returns {Object} 返回一个带有包装有 this.data 相关数据操作API的对象
 * */
export const data = (key, val) => {
    // TODO:context.data[key] = val;
    const obj = typeof key === 'string' ? {[key]: val} : key;
    dataCache.assign(obj);
    const dataKey = typeof key === 'string' ? key : Object.keys(key);
    context.dataManager = context.dataManager || [];
    const dh = new DataHandler(dataKey, dataCache);
    context.dataManager.push(dh);
    return dh;
};


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
 * 创建组件属性API的高阶函数，
 * 负责：filters、computed、messages、components、watch等API创建
 *
 * @param {string} name 数据的key，或者键值对
 * @returns {Function}
*/
function componentOptionCreator(optionName) {
    /**
     * 创建组件属性API方法
     * 参数可以是key、val两个参数，也可以是对象的形式
     *
     * @param {string|Object} name 数据的key，或者键值对
     * @param {Function} handler 添加的函数
    */
    return function (name, value) {
        context[optionName] = context[optionName] || {};

        switch (typeof name) {
            case 'string':
                context[optionName][name] = value;
                break;

            case 'object':
                Object.assign(context[optionName], name);
        }
    };
}

export const filters = componentOptionCreator('filters');
export const computed = componentOptionCreator('computed');
export const messages = componentOptionCreator('messages');
export const components = componentOptionCreator('components');
export const watch = componentOptionCreator('watches');

/**
 * 为组件添加方法
 * 参数可以是key、val两个参数，也可以是对象的形式
 *
 * @param {string|Object} name 数据的key，或者键值对
 * @param {Function} handler 添加的函数
*/
export const method = componentOptionCreator('methods');
