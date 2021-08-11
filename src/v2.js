/**
 * @file 方案二
*/

import san from 'san';

const globalInstance = {
    instance: null,
    renderingInstance: null,
    get() {
        return this.instance || this.renderingInstance;
    },
    set(instance) {
        this.instance = instance;
    }
};

const REACTIVE_KEY_NAME = '__s_isReactive';
const COMPUTED_KEY_NAME = '__s_isComputed';

const dataKey = Symbol('dataKey');

/**
 * 1. 新增setup扩展方法
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
            globalInstance.set(this);
            // ① 获取setup返回的方法和数据
            const composition = this.setup();
            const keys = Object.keys(composition);
            keys.forEach(key => {
                if (typeof composition[key] === 'function') {
                    // 实现setup中的定义方法
                    if (this[key]) {
                        console.log(`Error: method [${key}] is duplicated.`);
                    } else {
                        this[key] = composition[key];
                    }
                }
                
                else if(composition[key][REACTIVE_KEY_NAME]) {
                    const keyName = composition[key].keyName;
                    this.data.set(key, this.data.raw[keyName]);
                    this.data.set(keyName, undefined);
                    // 更新keyName
                    composition[key].keyName = key;
                }
                
                else if(composition[key][COMPUTED_KEY_NAME]) {
                    this.__setupComputed = this.__setupComputed || {};
                    Object.assign(this.__setupComputed, {
                        [key]: composition[key].computed
                    });
                }
            });

            // 初始化setup中的依赖
            this._doCalcComputed();

            // ② 实现生命周期钩子
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

    /**
     *  获取setup方法，调用san.component内部方法，重新初始化
     * TODO: 需要扩展_calcComputed，增加额外的参数？
    */
     _doCalcComputed() {
        this.__setupComputed && Object.keys(this.__setupComputed).forEach(expr => {
            if (!this.computedDeps[expr]) {
                this.computed[expr] = this.__setupComputed[expr];
                this._calcComputed(expr);
            }
        });
    }

    _calcComputed(computedExpr) {
        // TODO:
    }
};

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
const createHook = lifecycle => (hook, target = globalInstance.get()) => {
    injectHook(lifecycle, hook, target);
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
export const onCompiled = createHook('compiled');
export const onInited = createHook('inited');
export const onCreated = createHook('created');
export const onAttached = createHook('attached');
export const onDetached = createHook('detached');
export const onDisposed = createHook('disposed');



/**
 * 目标：函数的方式，设置data中的响应式数据
 *  function setup() {
        const person = setData({
            name: 'Jinz',
            count: 20
        });

        const increase = () => {
            person.set('name', person.get('name') + 1);
        };
        
        return {
            person,
            increase
        };
    };
 * 
 * @param {string} key 
 * @param {string|number|Object} value 
 */
let id = 0;
export const initData = data => {
    const currentInstance = globalInstance.get();
    const dataMethod = currentInstance.data;
    // 常用方法
    const methods = [
        'get',
        'set',
        'apply',
        'assign',
        'merge',
        'remove',
        'pop',
        'shift',
        'push',
        'unshift',
        'splice'
    ];
    const ret = {
        keyName: '_t' + id++,
        [REACTIVE_KEY_NAME]: true,
    };
    dataMethod.set(ret.keyName, data);
    methods.forEach(method => {
        ret[method] = function(expr, ...args) {
            return dataMethod[method](`${this.keyName}.${expr}`, ...args);
        };
    });
    return ret;
};

/**
 * 扩展计算属性
*/
export const computed = computed => {
    return {
        [COMPUTED_KEY_NAME]: 1,
        computed
    }
};

/**
 * @param any data data对象
*/
export const ref = data => {
    // TODO:
};

/**
 * 3. 增加watchEffect方法
 * 
 * @param Object data data对象
*/
export const watchEffect = callback => {
    // do something
};
