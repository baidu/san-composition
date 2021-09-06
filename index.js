/**
 * @file San组合式API
 */


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
                 this.watch(computedDatas[j].name, watcher);
             }
 
             this.__scContext.computedDatas = null;
         }
     }
 }
 
 function getComputedWatcher(name, fn) {
     return function () {
         let value = fn();
         this.data.set(name, value);
     };
 }
 
 
 /**
  * 通过组合式API定义San组件
  *
  * @param {Function} creator 通过调用组合式API的方法
  * @param {Object} san
  * @return {Function} 返回 san.defineComponent 定义的类
 */
 export const defineComponent = (creator, san) => {
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
             instance: this,
             inited: [
                 componentInitComputed
             ]
         };
         context = this.__scContext;
         contexts.push(context);
 
         let creatorAsInstance = defineContext.creator;
         creatorAsInstance();
 
         contexts.pop();
         context = contexts[contexts.length - 1];
 
         this.__scInitLifeCycle();
 
         san.Component.call(this, options);
     };
 
 
     function Empty() {}
     Empty.prototype = san.Component.prototype;
     ComponentClass.prototype = new Empty();
     ComponentClass.prototype.constructor = ComponentClass;
 
     ComponentClass.prototype.initData = componentInitData;
     ComponentClass.prototype.__scInitLifeCycle = componentInitLifeCycle;
 
     var disposeMethod = san.Component.prototype.dispose;
     ComponentClass.prototype.dispose = function (noDetach, noTransition) {
         this.__scContext = null;
         disposeMethod.call(this, noDetach, noTransition);
     };
 
 
     if (defineContext.template) {
         ComponentClass.prototype.template = defineContext.template;
     }
 
     if (defineContext.filters) {
         ComponentClass.prototype.filters = defineContext.filters;
     }
 
     if (defineContext.components) {
         ComponentClass.prototype.components = defineContext.components;
     }
 
     return ComponentClass;
 };
 
 /**
  * 处理template方法
  *
  * @param {string} tpl 组件的模板
 */
 export const template = tpl => {
     if (context.creator) {
         context.template = tpl;
     }
 };
 
 class DataProxy {
     constructor(name) {
         this.name = name;
         this.instance = context.instance;
     }
     
     get(name) {
         if (this.name) {
             let computedDatas = this.instance.__scContext.computedDatas;
             if (computedDatas) {
                 computedDatas.push(this);
             }
 
             return this.instance.data.get(this.name);
         }
 
         if (name) {
             return this.instance.data.get(name);
         }
     }
 
     set(name, value) {
         if (this.name) {
             this.instance.data.set(this.name, name);
         }
         else {
             this.instance.data.set(name, value);
         }
     }
 
     // TODO: proxy any other methods
 }
 
 
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
  * @param {*} value 设置的数据
  * @returns {Object} 返回一个带有包装有 this.data 相关数据操作API的对象
  * */
  export const data = (key, value) => {
     if (context.creator) {
         return;
     }
 
     switch (typeof key) {
         case 'string':
             if (!context.initData) {
                 context.initData = {};
             }
             
             context.initData[key] = value;
             return new DataProxy(key);
 
         case 'object':
             context.initData = key;
     }
 
     return new DataProxy();
 };
 
 class ComputedProxy {
     constructor(name) {
         this.name = name;
         this.instance = context.instance;
     }
     
     get() {
         if (this.name) {
             let computedDatas = this.instance.__scContext.computedDatas;
             if (computedDatas) {
                 computedDatas.push(this);
             }
 
             return this.instance.data.get(this.name);
         }
     }
 }
 
 export function computed(name, fn){
     if (context.creator) {
         return;
     }
 
     if (!context.computed) {
         context.computed = {};
     }
 
     context.computed[name] = fn;
     return new ComputedProxy(name);
 }
 
 
 /**
  * 创建组件类成员API的高阶函数，
  * 负责：filters、computed、messages、components、watch等API创建
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
 
 
 /**
  * 创建组件实例成员API的高阶函数，
  * 负责：computed、messages、watch等API创建
  *
  * @param {string} memberName 
  * @returns {Function}
 */
 function instanceMemberCreator(memberName) {
     /**
      * 创建组件属性API方法
      * 参数可以是key、val两个参数，也可以是对象的形式
      *
      * @param {string|Object} name 数据的key，或者键值对
      * @param {Function} handler 添加的函数
      */
     return function (name, value) {
         if (context.creator) {
             return;
         }
 
         let instance = context.instance;
         let target = instance[memberName];
         if (!instance.hasOwnProperty(memberName)) {
             target = instance[memberName] = {};
         }
 
         switch (typeof name) {
             case 'string':
                 target[name] = value;
                 break;
 
             case 'object':
                 Object.assign(target, name);
         }
     };
 }
 
 export const messages = instanceMemberCreator('messages');
 export const watch = instanceMemberCreator('watches');
 
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
             context.instance[name] = value;
             break;
 
         case 'object':
             Object.assign(context.instance, name);
     }
 }
 