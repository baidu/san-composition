/**
 * @file 方案二
*/

import san from 'san';

const REACTIVE_KEY_NAME = '__s_isReactive';
const COMPUTED_KEY_NAME = '__s_isComputed';

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
 * reactive
*/
const reactive = function (target, data) {
    Object.assign(target.data.raw, data);
    return target.data;
};

const watch = function (target, dataName, listener) {
    target.watch(dataName, listener);
};

/**
 * TODO: 这里执行时机有问题，待解决
*/
const computed = function (target, computed) {
    return Object.assign(target.computed, computed);
};

const getSetupApi = target => {
    return {
        reactive: reactive.bind(target, target),
        watch: watch.bind(target, target),
        computed: computed.bind(target, target)
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
