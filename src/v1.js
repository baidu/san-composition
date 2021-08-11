/**
 * @file 方案一：类Vue, composition-api
*/

import san from 'san';
import {isObject} from '../utils/utils';

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

const DATA_KEY_NAME = '__s_dataKey';
const REACTIVE_KEY_NAME = '__s_isReactive';
const COMPUTED_KEY_NAME = '__s_isComputed';

/**
 * 《组合式 API》
 * reference: https://v3.cn.vuejs.org/api/composition-api.html
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
            // TODO: 考虑通过参数提供额外的API
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
                } else if(composition[key][REACTIVE_KEY_NAME]) {
                    // 实现通过setup来设置data数据，设置绑定的data的变量名称
                    composition[key][DATA_KEY_NAME] = key;
                } else if(composition[key][COMPUTED_KEY_NAME]) {
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
    */
    _doCalcComputed(computedDeps) {
        // TODO: 这里要做依赖分析，computedDeps，
        // TODO: 考虑扩展san._calcComputed，增加额外的参数？
        this.__setupComputed && Object.keys(this.__setupComputed).forEach(expr => {
            this.computed[expr] = this.__setupComputed[expr];
            this._calcComputed(expr);
        });

        // TODO: 重置_calcComputed，收集依赖
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
 * 创建对象，添加一个标识位
*/
const createReactive = (obj, currentInstance, dataKeys) => {
    Object.keys(obj).forEach(item => {
        if (isObject(obj[item])) {
            obj[item] = createProxy(currentInstance, dataKeys.concat(item), obj[item]);
            obj[item][REACTIVE_KEY_NAME] = 1;
        }
    });
};

/**
 * 创建proxy，通过 = 赋值的方式直接监听数据变化
*/
const createProxy = (currentInstance, dataKeys, target) =>{
    return new Proxy(target, {
        get(obj, prop) {
            // return dataKeys.length 
            // ? currentInstance.data.get(dataKeys.join('.'))
            // : obj[prop];
            return obj[prop];
        },
        set(obj, prop, value) {
            // 第一次的set是初始化响应式数据
            if (prop === DATA_KEY_NAME) {
                // 把data变量名称，存储到数组
                dataKeys.push(value);

                // 把初始化的对象转换为响应式
                createReactive(obj, currentInstance, dataKeys);

                // 将响应式绑定到data的声明
                currentInstance.data.set(value, obj); 
            }

            // 因为可能是深层对象，所以需要递归
            else if (prop === REACTIVE_KEY_NAME) {
                createReactive(obj, currentInstance, dataKeys);
            }
            
            else if (dataKeys.length) {
                currentInstance.data.set(dataKeys.concat(prop).join('.'), value);
                obj[prop] = value;
                currentInstance._doCalcComputed();
            }

            return true;
        }
    });
};

/**
 * 《响应性 API》
 * reference: https://v3.cn.vuejs.org/api/reactivity-api.html
 * 
 * 增加reactive方法，实现data的reactive，
 * 
 * @param Object data data对象
*/
export const reactive = data => {
    if (!isObject(data)) {
        console.error('"reactive" method must be called on an object.');
        return data;
    }
    const currentInstance = globalInstance.get();
    let dataKeys = [];
    data[REACTIVE_KEY_NAME] = 1;
    return createProxy(currentInstance, dataKeys, data);
};

/**
 * 检查对象是否是由 reactive 创建的响应式代理
 *
 * @param {*} data 
 */
export const isReactive = data => {
    return data[REACTIVE_KEY_NAME];
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
 * 增加watch方法，这里通san的watch方法，key必须是最终的data的路径
 * 
 * @param Object data data对象
*/
export const watch = (key, callback) => {
    const currentInstance = globalInstance.get();
    currentInstance.watch(key, callback);
};

/**
 * 增加watchEffect方法
 * 
 * @param Object data data对象
*/
export const watchEffect = callback => {
    // TODO:
};

/**
 * 返回 reactive 代理的原始对象
 */
export const toRaw = data => {
    // TODO:
};

/**
 * 
 * @param {*} data 
 */
export const isProxy = data => {
    // TODO:
};

/**
 * 
 * @param {*} data 
 */
export const readonly = data => {
    // TODO:
};

/**
 * 接受一个内部值并返回一个响应式且可变的 ref 对象
 * ref 对象具有指向内部值的单个 property .value
 *
 * @param any data data对象
*/
export const ref = data => {
    // TODO:
};

/**
 * 
 * @param {*} callback 
 */
 export const toRefs = callback => {
    // TODO:
};


/**
 * 创建一个响应式代理，它跟踪其自身 property 的响应性
 * 但不执行嵌套对象的深层响应式转换 (暴露原始值)
 * 
*/
export const shallowReactive = data => {
    // TODO:
};


/**
 * 创建一个 proxy，使其自身的 property 为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)
 * @param {*} data 
 */
export const shallowReadonly = data => {
    // TODO:
};
