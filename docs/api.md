# san-composition API



## 定义组件的方法

### defineComponent

定义组件的方法，它的作用类似于 san.defineComponent，但是传的参数不同。

**描述**

`{ComponentClass} defineComponent(creator, san)`

**参数**

- `{Function} creator` 该函数内部通过组合式API来定义组件
- `{Object} san` 将san通过参数传入

**返回**

`{ComponentClass}`

返回一个组件类

**示例**

```js
import san from 'san';
import {defineComponent, template, data} from 'san-composition';
defineComponent(() => {
   template('<div>Hello {{name}}.</div>');
   data('name', 'san');
}, san);
```


## 组合式API

### template(tpl)

定义组件模板的的方法。

**描述**

`template(tpl)`

**参数**

- `{string} tpl` 模板字符串

**返回**

无

**示例**

```js
defineComponent(() => {
   template('<div>Hello {{name}}.</div>');
}, san);
```



### data(key, value)

初始化数据的方法，它的作用相当于使用 initData 来初始化数据。不同的是它可以被调用多次。

**描述**

`data(key, value)`

**参数**

- `{string} key`
- `{*} value`

**返回**

`{Object}`

该方法的返回值是一个 <a id="DataProxy">DataProxy</a>  的实例对象，这个对象提供了 12 个和 San 组件 data 上同名的 [数据操作](https://baidu.github.io/san/tutorial/data-method/) 的方法。

**示例**

```js
 const App =  defineComponent(() => {
    template(`
         <div>
             <div>count: {{ count }} </div>
             <input type="text" value="{= count =}"/>
             <div>name: {{ info.name }} </div>
             <div>company: {{ info.company }} </div>
         </div>
     `);

    const count = data('count', 1);

    const info = data('info', {
        name: 'erik',
        company: 'baidu'
    });

    method({
        increment: () => {
            console.log(info.get()); 
            // {name: 'erik', company: 'baidu'}

            console.log(info.get('name'));
            // erik

            count.set(count.get() + 1);
        },
        decrement: () => {
            count.set(count.get() - 1);
        }
    });
}, san);
```

**注意**

1. data 方法返回的 DataProxy 实例对象提供的 12 个API，除了 assign 方法（该方法不需要 key ）与San 组件的 data 上提供的方法完全相同以外，其他的方法都省略了 key 参数，默认使用调用 data 方法时传的 key 参数，详见 <a id="DataProxy">DataProxy</a> 部分。

2. data 方法返回的对象，可以在 method、computed等其他组合式API方法中使用，不能在 defineComponent 中直接调用。

   ```js
   const App =  defineComponent(() => {
       template(/* ... */);
   
       const count = data('count', 1);
    
       method({
           increment: () => {
              // 正确
              count.set(count.get() + 1);
           }
       });
     
     	// 错误
     	count.set(count.get() + 1);
   }, san);
   ```

   


### method

定义组件中的方法

**描述**

`method(nameOrObj, [handler])`

**参数**

- `{string|Object} nameOrObj`  为组件添加的方法的名称，或者对象键值对的形式定义多个方法
- `{Function?} handler` 为组件添加的方法体，如果第一个参数是对象的形式，第二个参数会被忽略

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template(/* ... */);

    const count = data('count', 1);
 
    method({
        increment: () => {
            count.set(count.get() + 1);
        }
    });
  
    // or
    method('decrement', () => {
       count.set(count.get() - 1);
    });
}, san);
```


### watch

为组件添加的 [watch](https://baidu.github.io/san/doc/api/#watch) 方法，监听组件的数据变化。

**描述**

`watch(exprOrObj, [handler])`

**参数**

- `{string|Object} exprOrObj`  监听的数据的name或表达式，或者对象键值对的形式定义多个监听方法
- `{Function?} handler` 数据变化后的回调方法，如果第一个参数是对象的形式，第二个参数会被忽略

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template(`
        <div>
            <span>company: {{company}}</span>
            <button on-click="hop">hop</button>
        </div>
    `);

    const info = data('company', 'baidu');

    watch('company', function (value, e) {
        console.log(`company changes, new company: ${value}`);
    });

    method('hop', () => {
        info.set('baidu ~' + Math.random());
    });
```

### computed

为组件添加 [计算数据(computed)](https://baidu.github.io/san/doc/api/#computed) 属性，声明组件中的计算数据。

**描述**

`{Object}computed(name, handler)`

**参数**

- `{string} name`  计算数据的name
- `{Function} handler` 数据的计算逻辑

**返回**

`{Object}`

返回一个只有 get 方法的对象，通过该对象的 get 方法可以获取到 computed 方法定义的数据的当前值。

**示例**

```js
const App =  defineComponent(() => {
    template(`
        <div>            
            <div><span>name: {{name}}</span></div>
            <div><span>msg: {{msg}}</span></div>
            <div><span>more: {{more}}</span></div>
        </div>
    `);

    const info = data('info', {
        first: 'first',
        last: 'last',
        email: 'name@name.com'
    });

    const name = computed('name', function () {
        return info.get('first') + ' ' + info.get('last');
    });

    // 虽然不推荐用this，但是内部的this还是支持的
    const msg = computed('msg', function () {
        return this.data.get('name') + '(' + info.get('email') + ')';
    });

    // 通过get方法获取另一个计算属性的值
    const more = computed('more', function () {
        return msg.get() + ' | ' + name.get();
    });
}, san);
```


### filters

为组件添加 [过滤器(filters)](https://baidu.github.io/san/doc/api/#filters) 属性，声明组件视图模板中可以使用哪些过滤器。

**描述**

`filters(nameOrObj, [handler])`

**参数**

- `{string|Object} nameOrObj`  为组件添加的过滤器名称，或者对象键值对的形式定义多个过滤器
- `{Function?} handler` 无副作用的纯函数来定义过滤器的逻辑，如果第一个参数是对象的形式，第二个参数会被忽略

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div> {{ count|tripleAndAdd(100)}} </div>');

    const count = data('count', 1);
 
    filters('tripleAndAdd', (value, num) => {
        return value * 3 + num;
    });
}, san);
```


### components


为组件添加 [子组件(components)](https://baidu.github.io/san/doc/api/#filters) 属性，声明组件中可以使用哪些类型的子组件。

**描述**

`components(nameOrObj, [compt])`

**参数**

- `{string|Object} nameOrObj`  为组件添加的子组件名称，或者对象键值对的形式定义多个子组件
- `{ComponentClass?} compt` 无副作用的纯函数来定义过滤器的逻辑，如果第一个参数是对象的形式，第二个参数会被忽略

**返回**

无

**示例**

```js
const MyComponent = defineComponent(() => {
    template(`
        <div>
            <div>Hi</div>
            <my-child></my-child>
        </div>
    `);

    components({
        'my-child': defineComponent(() => template('<div>My Child</div>'), san)
    });
}, san);
```


### messages

为组件添加 [子组件派发消息(messages)](https://baidu.github.io/san/doc/api/#messages) 属性，声明处理子组件派发消息的方法。

**描述**

`messages(nameOrObj, [handler])`

**参数**

- `{string|Object} nameOrObj`  子组件派发消息的名称，或者对象键值对的形式定义多个子组件
- `{Function?} handler` 收到子组件派发的消息后的回调方法，如果第一个参数是对象的形式，第二个参数会被忽略

**返回**

无

**示例**

```js
const Select = defineComponent(() => {
    template('<ul><slot></slot></ul>');
    const value = data('value', '');
    messages({
        'UI:select-item-selected': function (arg) {
            value.set(arg.value);
        },

        'UI:select-item-attached': function (arg) {
            this.items.push(arg.target);
            arg.target.data.set('selectValue', value.get());
        },

        'UI:select-item-detached': function (arg) {
            let len = this.items.length;
            while (len--) {
                if (this.items[len] === arg.target) {
                    this.items.splice(len, 1);
                }
            }
        }
    });

    onInited(function () {
        this.items = [];
    });
}, san);


let SelectItem = defineComponent(() => {
    template('<li on-click="select"><slot></slot></li>');
    const value = data('value', '');
    method({
        select: function () {
            this.dispatch('UI:select-item-selected', value.get());
        }
    });

    onAttached(function () {
        this.dispatch('UI:select-item-attached');
    });

    onDetached(function () {
        this.dispatch('UI:select-item-detached');
    });
}, san);

let App = defineComponent(() => {
    components({
        'ui-select': Select,
        'ui-selectitem': SelectItem
    });

    template(`
        <div>
            <strong>Messages</strong>
            <ui-select value="{=v=}">
                <ui-selectitem value="1">one</ui-selectitem>
                <ui-selectitem value="2">two</ui-selectitem>
            </ui-select>
            please click to select a item
            <b title="{{v}}">{{v}}</b>
        </div>
        `
    );
}, san);

```


### onConstruct

为组件添加 construct（组件初始化开始）钩子方法


**描述**

`onConstruct(handler)`

**参数**

- `{Function} handler` 在 construct 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onConstruct(() => {
        console.log('onConstruct');
    });

    onConstruct(() => {
        console.log('another onConstruct');
    });
}, san);
```


### onCompiled
为组件添加 compiled（组件视图模板编译完成） [生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)方法

**描述**

`onCompiled(handler)`

**参数**

- `{Function} handler` 在 compiled 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onCompiled(() => {
        console.log('onCompiled');
    });
}, san);

```


## onInited

为组件添加 inited（组件实例初始化完成） [生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)方法

**描述**

`onInited(handler)`

**参数**

- `{Function} handler` 在 inited 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onInited(() => {
        console.log('onInited');
    });
}, san);
```


### onCreated

为组件添加 created（组件元素创建完成） [生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)方法

**描述**

`onCreated(handler)`

**参数**

- `{Function} handler` 在 created 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onCreated(() => {
        console.log('onCreated');
    });
}, san);

```


### onAttached

为组件添加 attached（组件已被附加到页面）[生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)

**描述**

`onAttached(handler)`

**参数**

- `{Function} handler` 在 attached 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onAttached(() => {
        console.log('onAttached');
    });
}, san);
```


### onDetached

为组件添加 detached（组件从页面中移除） [生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)方法

**描述**

`onDetached(handler)`

**参数**

- `{Function} handler` 在 detached 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onDetached(() => {
        console.log('onDetached');
    });
}, san);
```


### onDisposed

为组件添加 disposed（组件卸载完成） [生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)方法

**描述**

`onDisposed(handler)`

**参数**

- `{Function} handler` 在 disposed 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onDisposed(() => {
        console.log('onDisposed');
    });
}, san);
```


### onUpdated

为组件添加 updated（组件视图刷新后） [生命周期钩子](https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)方法

**描述**

`onUpdated(handler)`

**参数**

- `{Function} handler` 在 updated 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onUpdated(() => {
        console.log('onUpdated');
    });
}, san);
```

### onError

为组件添加 error（处理组件异常）钩子方法

**描述**

`onError(handler)`

**参数**

- `{Function} handler` 在 error 过程到达时触发的钩子函数

**返回**

无

**示例**

```js
const App =  defineComponent(() => {
    template('<div>Hi</div>');

    onError(() => {
        console.log('onError');
    });
}, san);
```

