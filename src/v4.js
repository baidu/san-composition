/**
 * @file San组合式API（方案四）
*/

import san from 'san';

let context = {};
const resetContext = () => context = {};
const componentOptions = {
    basicOptions: [
        'method',
        'computed',
        'messages',
        'filters',
        'components'
    ],
    lifecycleHooks: [
        'inited',
        'created',
        'attached',
        'detached',
        'disposed',
        'updated'
    ],
    watch: 'watch',
    reversion: ['el', 'data']
};

/**
 * 通过组合式API定义San组件
 * 
 * @param {Function} creator 通过调用组合式API的方法
 * @param {Object} extOptions 这里传递，无法通过组合式API传递的参数
 * @param {string} [extOptions.el] 组件根元素，不使用 template 渲染视图时使用，组件反解时使用
 * @param {Object} [extOptions.data] 组件数据，组件反解时使用
 * @return {Function} 返回 san.defineComponent 定义的类
*/
export const setupComponent = (creator, extOptions = {}) => {
    resetContext();
    creator();
    const options = {};
    // 模板
    options.template = context.template;

    console.log({options});

    // 数据
    const initData = context.data;
    options.initData = () => initData;

    componentOptions.reversion.forEach(k => extOptions[k] && (options[k] = extOptions[k]));

    // 处理watch方法
    if (context.watch) {
        const watch = context.watch;
        Object.keys(watch).forEach(item => {
            context.attached = context.attached || [];
            context.attached.push(function() {
                this.watch(item, watch[item])
            });
        });
    }

    // 生命周期方法
    componentOptions.lifecycleHooks.forEach(action => {
        if (context[action] && context[action].length) {
            options[action] = function() {
                context[action].forEach(fn => fn.call(this));
            };
        }
    });

    // 处理方法
    Object.assign(options, context.method);
    
    return san.defineComponent(options);
};

/**
 * 处理template方法
*/
exports.template = tpl => {
    context.template = tpl;
};

/**
 * 设置，获取数据
 * 
 * @param {string|Object} key 数据的key，或者键值对 
 * @param {any} val 数据值 
 */
exports.data = (key, val) => {
    const obj = typeof key === 'string' ? {[key]: val} : key;
    context.data = context.data || {};
    Object.assign(context.data, obj);
    return obj;
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
 * 处理其他API
*/
componentOptions.basicOptions.concat('watch').forEach(item => {
    exports[item] = (key, val) => {
        const obj = typeof key === 'string' ? {[key]: val} : key;
        context[item] = context.item || {};
        Object.assign(context[item], obj);
    };
});
