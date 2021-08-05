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

            // TODO: setup(context) {} setup提供的API
            keys.forEach(key => {
                if (typeof composition[key] === 'function') {
                    // 实现setup中的定义方法
                    if (this[key]) {
                        console.log(`Error: method [${key}] is duplicated.`);
                    } else {
                        this[key] = composition[key];
                    }
                } else {
                    // 实现通过setup来设置data数据
                    composition[key][dataKey] = key;
                }
            });

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

    // attach(...args) {
    //     super.attach.call(this, ...args);
    // }
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
 * 2. 增加reactive方法，实现data的reactive，
 *    这里不能简单返回this.data，要解决名称的冲突问题
 * 
 * @param Object data data对象
*/
export const reactive = data => {
    const currentInstance = globalInstance.get();
    let name;
    return new Proxy(data, {
        get(obj, prop) {
            // 不能获取不在reactive下的东西
            if (!prop in data) {
                return;
            }
            return name ? currentInstance.data.get(`${name}.${prop}`) : obj[prop];
        },
        set(obj, prop, value) {
            if (prop === dataKey) {
                name = value;
                // 初始化
                currentInstance.data.set(name, obj);
                return true;
            }

            // 不能设置不在reactive下的东西
            if (!prop in data) {
                console.error(`[${prop}] is not existed in the Object.`);
                return;
            }

            if (name) {
                currentInstance.data.set(`${name}.${prop}`, value);
            } else {
                obj[prop] = value;
            }

            return true;
        }
    });
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
