/**
 * @file San组合式API（方案三）
*/

import san from 'san';

/**
 * 添加生命周期回调的高阶函数
 * 
 * @param {string} lifecycle 
 * @param {Object} scope 
 * @returns 
 */
const injectHook = (lifecycle, hook, target) => {
    const hooks = target._setupHooks[lifecycle] = target._setupHooks[lifecycle] || [];
    hooks.push(hook);
};

/**
 * 添加生命周期回调方法
 * 
 * @param {string} lifecycle 
 * @param {Object} scope 
 * @returns 
 */
const createHook = lifecycle => function(target, hook) {
    return injectHook(lifecycle, hook, target);
};

/**
 * 生命周期钩子方法，直接在san的组件生命周期中注入setup
 * 
 * 注：选择san的生命周期最早的钩子：compiled
 * compiled - 组件视图模板编译完成
 * inited - 组件实例初始化完成
 * created - 组件元素创建完成
 * attached - 组件已被附加到页面中
 * detached - 组件从页面中移除
 * disposed - 组件卸载完成
*/
const getHooksApi = target => {
    return {
        onCompiled: createHook('compiled').bind(target, target),
        onInited: createHook('inited').bind(target, target),
        onCreated: createHook('created').bind(target, target),
        onAttached: createHook('attached').bind(target, target),
        onDetached: createHook('detached').bind(target, target),
        onDisposed: createHook('disposed').bind(target, target),
    }
};

/**
 * setData 包装组件基础的data对象
*/
const setData = function (extData, val) {
    Object.assign(extData.raw(), val);
    return extData;
};

const watch = function (target, dataName, listener) {
    target.watch(dataName, listener);
};

/**
 * 处理计算属性
*/
const computed = function (target, extData, computed) {
    Object.keys(computed).forEach(key => {
        // 监听数值的变化
        extData._computingName = key;
        extData._computingFn = function() {
            target.data.set(key, computed[key].call(target));
        };
        // 计算出computed的值，挂在data上
        target.data.set(key, computed[key].call(target));
        extData._computingFn = null;
        extData._computing = null;
    });
};

const getSetupApi = target => {
    const methods = [
        // 'get', 
        'set', 
        'merge', 'assign', 'apply',
        'splice', 'push', 'pop', 'unshift', 'shift', 'remove', 'removeAt',
        'listen', 'fire', 'unlisten'
    ];
    // 包装data方法，解决计算属性依赖收集问题
    const extData = {
        computedDeps: {},
        raw() {
            return target.data.raw;
        },
        get(name) {
            if (this._computingFn) {
                const deps = this._computingName + '_' + name;
                if (!this.computedDeps[deps]) {
                    this.computedDeps[deps] = 1;
                    const _computingFn = this._computingFn;
                    target.watch(name, () => {
                        _computingFn();
                    });
                }
            }
            return target.data.get(name);
        }
    };
    methods.forEach(key => {
        extData[key] = function() {
            return target.data[key].apply(target.data, arguments);
        };
    });
    return {
        setData: setData.bind(target, extData),
        watch: watch.bind(target, target),
        computed: computed.bind(target, target, extData)
    };
};

/**
 * 新增setup扩展方法
 * 
 * @return 返回响应式的数据
 *  - properties => initData: 属性挂到data下面
 *  - methods => this： 方法挂到this下面
 **/
 export class Component extends san.Component {
    constructor(options = {}) {
        super(options);
        if (typeof this.setup === 'function') {
            this._setupHooks = {};

            const composition = this.setup({
                ...getHooksApi(this),
                ...getSetupApi(this)
            });

            const keys = Object.keys(composition);
            
            keys.forEach(key => {
                // 把返回值添加到当前组件中
                this[key] = composition[key];
            });

            // 实现生命周期钩子
            const _toPhase = this._toPhase;
            this._toPhase = name => {
                const hooks = this._setupHooks[name] || [];
                hooks.forEach(hook => {
                    typeof hook === 'function' && hook.call(this);
                });
                _toPhase.call(this, name);
            };
        }
    }
};
