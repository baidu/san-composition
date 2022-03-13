# san-composition API

- [defineComponent](#defineComponent)
- [template](#template)
- [data](#data)
- [DataProxy](#DataProxy)
- [method](#method)
- [watch](#watch)
- [computed](#computed)
- [filters](#filters)
- [components](#components)
- [messages](#messages)
- [onConstruct](#onConstruct)
- [onCompiled](#onCompiled)
- [onInited](#onInited)
- [onCreated](#onCreated)
- [onAttached](#onAttached)
- [onDetached](#onDetached)
- [onDisposed](#onDisposed)
- [onUpdated](#onUpdated)
- [onError](#onError)

## defineComponent

定义组件。

**描述**

`{ComponentClass} defineComponent(creator, san)`

**参数**

- `{Function} creator` 该函数内部通过组合式 API 来定义组件，它接收一个 `context` 参数，该参数提供 `dispatch`、`fire`、`nextTick`、`ref` 等方法，分别对应组件实例上的同名方法；`context` 还提供 `component` 属性来获取组件的实例
- `{Object} san` 将 san 通过参数传入

**返回**

`{ComponentClass}`

返回一个组件类

**示例**

```js
import san from 'san';
import {defineComponent, template, data} from 'san-composition';

const HelloComponent = defineComponent(context => {
   template('<div>Hello {{name}}.</div>');
   data('name', 'san');
   method('demo', function () {
        // 获取组件对应的 HTML 元素
       console.log(context.component.el);
    });
}, san);
```

> 注意：除 defineComponent 以外，其他 API 只能在 defineComponent 方法中的第一个函数参数中执行。


## template

定义组件模板的方法。

**描述**

`template(tpl)`

**参数**

- `{string} tpl` 模板字符串，支持 Template Strings 语法糖。

**返回**

无

**示例**

```js
defineComponent(() => {
   template('<div>Hello {{name}}.</div>');

   // 或者
   // template`<div>Hello {{name}}.</div>`;
}, san);
```



## data

初始化一个数据项。

**描述**

`data(key, value)`

**参数**

- `{string} key`
- `{*} value`

**返回**

`{Object}`

该方法的返回值是一个 [DataProxy](#DataProxy) 的实例，提供了和 San 组件 data 对象上同名的 [数据操作](https://baidu.github.io/san/tutorial/data-method/) 的方法。

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

1. data 方法返回的 DataProxy 实例对象提供了操作数据的 API，这些 API 默认使用调用 data 方法时传入的 key 参数，与 San 组件的 data 上提供的方法一一对应（除了不提供 assign 方法），详见 <a href="#DataProxy">DataProxy</a> 部分。

2. data 方法返回的对象，可以在 method、computed 等其他组合式 API 方法中使用，不能在 defineComponent 中直接调用。

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

## DataProxy

组件中 data 的代理类，调用组合式API的 <a href="#datakey-value">data</a> 方法时，会返回一个 DataProxy 的实例。

> 注意：DataProxy 的所有实例方法都不支持控制视图更新行为 [option](https://baidu.github.io/san/tutorial/data-method/#option) 参数对象。

### get

获取 data API设置的数据，如果传入参数，则根据参数来深度获取数据

**描述**

`{*} get(expr?)`

**参数**

- `{string?} expr` 通过 expr 参数来深度获取 data 设置的数据

**返回**

`{*}`

返回 data API设置的数据，或者子数据

**示例**

```js

const name = data('name', 'san');   
const info = data('info', {name: 'erik', company: 'baidu'});

onAttached(() => {
    name.get(); 
    // 'san'

    info.get();
    // {name: 'erik', company: 'baidu'}

    info.get('name');
    // 'erik'
});

```


### set

修改 data API 设置的数据

**描述**

`set(exprOrVal, [value])`

**参数**

- `{string|*} exprOrVal`
    - `{*}` 只有 1 个参数时，表示修改后的数据的值
    - `{string}`  有 2 个参数时，作为深度设置的表达式
- `{*?} value` 深度设置的数据

**返回**

无

**示例**

```js

const name = data('name', 'san');   
const info = data('info', {name: 'erik', company: 'baidu'});

onAttached(() => {
    name.set('sca');
    name.get();
    // 'sca'
    

    info.set('name', 'jinz');
    
    info.get();
    // {name: 'jinz', company: 'baidu'}
});

```

### merge

使用传入数据对象与data API 设置的数据进行合并，也可以通过参数指定子项

**描述**

`merge(exprOrObj, [source])`

**参数**

- `{string|Object} exprOrObj`
    - `{Object}` 只有 1 个参数时，表示传入的数据对象
    - `{string}` 有 2 个参数时，第1个参数指定深度操作的数据项
- `{Object}source` 深度合并的数据对象

**返回**

无

**示例**

```js
 
const info = data('info', {name: 'erik', company: 'baidu', extra: {role: 1}});

onAttached(() => {
    info.merge({
        company: '百度',
        sex: 'male'
    });
    
    info.get();
    // {name: 'erik', company: '百度', sex: 'male', extra: {role: 1}}

    info.merge('extra', {
        type: 1,
        role: 10
    });

    info.get();
    // {name: 'erik', company: '百度', sex: 'male', extra: {type: 1, role: 10}};
});

```

### apply

apply 方法接受一个函数作为参数，传入当前的值到函数，然后用新返回的值更新它

**描述**

`apply(exprOrFn, [fn])`

**参数**

- `{string|Object} exprOrFn`
    - `{Function}` 只有 1 个参数时，表示传入的函数
    - `{string}` 有 2 个参数时，第1个参数指定深度操作的数据项
- `{Function}fn` 传入的函数

**返回**

无


**示例**

```js
 
const number = data('number', 1);
const info = data('info', {number: 1});

onAttached(() => {
    number.apply(n => n + 1);
    number.get();
    // 2

    info.apply('number', n => n + 1);
    info.get();
    // {number: 2}
});

```

### push

在数组末尾插入一条数据

**描述**
`push(exprOrVal, [value])`

**参数**

- `{string|*} exprOrVal`
    - `{*}` 只有 1 个参数时，表示插入的数据
    - `{string}` 有 2 个参数时，第1个参数指定深度操作的数据项
- `{*?} value` 向数据子项的数组中插入的数据

**返回**

无


**示例**

```js
 
const arr = data('arr', ['a', 'b']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.push('c');
    arr.get();
    // ['a', 'b', 'c']

    dataList.push('list', 'c');
    dataList.get();
    // {list: ['a', 'b', 'c']}
});

```
### pop

在数组末尾弹出一条数据。

**描述**
`pop([expr])`

**参数**

- `{string?} expr` 指定深度操作的数据项

**返回**

无

**示例**

```js
 
const arr = data('arr', ['a', 'b']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.pop();
    arr.get();
    // ['a']

    dataList.pop('list', 'c');
    dataList.get();
    // {list: ['a']}
});

```

### unshift

在数组开始处插入一条数据

**描述**
`unshift(exprOrVal[, value])`

**参数**

- `{string|*} exprOrVal`
    - `{*}` 只有 1 个参数时，表示添加的数据
    - `{string}` 有 2 个参数时，第 1 个参数指定深度操作的数据项
- `{*?} value` 深度设置的数据

**返回**

无


**示例**

```js
 
const arr = data('arr', ['a', 'b']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.unshift('c');
    arr.get();
    // ['c', 'a', 'b']

    dataList.unshift('list', 'c');
    dataList.get();
    // {list: ['c', 'a', 'b']}
});

```

### shift

在数组开始弹出一条数据。

**描述**
`shift([expr])`

**参数**

- `{string?} expr` 指定深度操作的数据项

**返回**

无

**示例**

```js
 
const arr = data('arr', ['a', 'b']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.shift();
    arr.get();
    // ['b']

    dataList.shift('list', 'c');
    dataList.get();
    // {list: ['b']}
});

```

### remove

移除一条数据。只有当数组项与传入项完全相等(===)时，数组项才会被移除。

**描述**

`remove(exprOrItem, [item])`

**参数**

- `{string|*} exprOrItem`
    - `{*}` 只有 1 个参数时，表示传入的数组项
    - `{string}` 有 2 个参数时，第 1 个参数指定深度操作的数据项
- `{*?}item` 传入的数组项

**返回**

无


**示例**

```js
 
const arr = data('arr', ['a', 'b', 'c']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.remove('b');
    arr.get();
    // ['a', 'c']

    dataList.remove('list', 'b');
    dataList.get();
    // {list: ['a', 'c']}
});

```

### removeAt

通过数据项的索引移除一条数据。

**描述**

`removeAt(exprOrIndex, index)`

**参数**

- `{string|number} exprOrIndex`
    - `{number}` 只有 1 个参数时，表示传入的索引
    - `{string}` 有 2 个参数时，第 1 个参数指定深度操作的数据项
- `{number?}index` 传入的索引

**返回**

无


**示例**
```js
const arr = data('arr', ['a', 'b']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.removeAt(1);
    
    arr.get();
    // ['a']

    dataList.removeAt('list', 1);
    dataList.get();
    // {list: ['a']}
});

```
### splice

向数组中添加或删除项目。

**描述**

`splice(exprOrSpliceArgs, spliceArgs)`

**参数**

- `{string|Array} exprOrSpliceArgs`
    - `{Array}` 只有 1 个参数时，表示传入的数组splice操作的参数
    - `{string}` 有 2 个参数时，指定操作的子数据项
- `{Array}spliceArgs` 数组splice操作的参数

**返回**

无


**示例**
```js
 
const arr = data('arr', ['a', 'b', 'c']);
const dataList = data('dataList', {
    list: ['a', 'b']
});

onAttached(() => {
    arr.splice([1, 1]);
    arr.get();
    // ['a', 'c']

    dataList.splice('list', [1, 1]);
    dataList.get();
    // {list: ['a', 'c']}
});

```

## method

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
const App = defineComponent(() => {
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


## watch

为组件添加的 [watch](https://baidu.github.io/san/doc/api/#watch) 方法，监听组件的数据变化。

**描述**

`watch(exprOrWatchers[, handler])`

**参数**

- `{string|Object} exprOrWatchers`  监听的数据的name或表达式，或者对象键值对的形式定义多个监听方法
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
}, san);
```

## computed

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
const App =  defineComponent(context => {
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

    const msg = computed('msg', function () {
        return context.component.data.get('name') + '(' + info.get('email') + ')';
    });

    // 通过get方法获取另一个计算属性的值
    const more = computed('more', function () {
        return msg.get() + ' | ' + name.get();
    });
}, san);
```

## filters

为组件添加 [过滤器(filters)](https://baidu.github.io/san/doc/api/#filters) 属性，声明组件视图模板中可以使用哪些过滤器。

**描述**

`filters(nameOrFilters[, handler])`

**参数**

- `{string|Object} nameOrFilters`  为组件添加的过滤器名称，或者对象键值对的形式定义多个过滤器
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


## components


为组件添加 [子组件(components)](https://baidu.github.io/san/doc/api/#filters) 属性，声明组件中可以使用哪些类型的子组件。

**描述**

`components(nameOrCmpts[, cmpt])`

**参数**

- `{string|Object} nameOrCmpts`  为组件添加的子组件名称，或者对象键值对的形式定义多个子组件
- `{ComponentClass?} cmpt` 无副作用的纯函数来定义过滤器的逻辑，如果第一个参数是对象的形式，第二个参数会被忽略

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


## messages

为组件添加 [子组件派发消息(messages)](https://baidu.github.io/san/doc/api/#messages) 属性，声明处理子组件派发消息的方法。

**描述**

`messages(nameOrMsgs[, handler])`

**参数**

- `{string|Object} nameOrMsgs`  子组件派发消息的名称，或者对象键值对的形式定义多个子组件
- `{Function?} handler` 收到子组件派发的消息后的回调方法，如果第一个参数是对象的形式，第二个参数会被忽略

**返回**

无

**示例**

```js
const Select = defineComponent(context => {
    template('<ul><slot></slot></ul>');
    const value = data('value', '');
    messages({
        'UI:select-item-selected': function (arg) {
            value.set(arg.value);
        },

        'UI:select-item-attached': function (arg) {
            context.component.items.push(arg.target);
            arg.target.data.set('selectValue', value.get());
        },

        'UI:select-item-detached': function (arg) {
            let len = context.component.items.length;
            while (len--) {
                if (context.component.items[len] === arg.target) {
                    context.component.items.splice(len, 1);
                }
            }
        }
    });

    onInited(function () {
        context.component.items = [];
    });
}, san);


let SelectItem = defineComponent(context => {
    template('<li on-click="select"><slot></slot></li>');
    const value = data('value', '');
    method({
        select: function () {
            context.dispatch('UI:select-item-selected', value.get());
        }
    });

    onAttached(function () {
        context.dispatch('UI:select-item-attached');
    });

    onDetached(function () {
        context.dispatch('UI:select-item-detached');
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


## onConstruct

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


## onCompiled
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


## onCreated

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


## onAttached

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


## onDetached

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


## onDisposed

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


## onUpdated

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

## onError

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

