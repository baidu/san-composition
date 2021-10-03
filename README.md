# san-composition

[![NPM version](http://img.shields.io/npm/v/san-composition.svg?style=flat-square)](https://npmjs.org/package/san-composition)
[![License](https://img.shields.io/github/license/baidu/san-composition.svg?style=flat-square)](https://npmjs.org/package/san-composition)


随着业务的不断发展，前端项目往往变得越来越复杂，过去我们使用 options 定义组件的方式随着功能的迭代可读性可能会越来越差，当我们为组件添加额外功能时，通常需要修改（initData、attached、computed等）多个代码块；而在一些情况下，按功能来组织代码显然更有意义，也更方便细粒度的代码复用。

san-composition 提供一组与定义组件 options 的 key 对应的方法来定义组件的属性和方法，让开发者可以通过逻辑相关性来组织代码，从而提高代码的可读性和可维护性。

- [安装](#安装)
- [基础用法](#基础用法)
- [进阶篇](#进阶篇) 
- [API](https://github.com/baidu/san-composition/blob/master/docs/api.md)

## 安装

**NPM**

```
npm i --save san-composition
```

## 基础用法

在定义一个组件的时候，我们通常需要定义模板、初始化数据、定义方法、添加生命周期钩子等。在使用组合式 API 定义组件时，我们不再使用一个 options 对象声明属性和方法，而是用各个 option 对应的方法来解决组件的各种属性、方法的定义。

> 注意：所有的组合式 API 方法都只能在 defineComponent 方法的第一个函数参数运行过程中执行。

### 定义模板

使用 [template](https://github.com/baidu/san-composition/blob/master/docs/api.md#template) 方法来定义组件的模板：

```js
import san from 'san';
import { defineComponent, template } from 'san-composition';

export default defineComponent(() => {
    template(`
        <div>
            <span>count: {{ count }} </span>
            <button on-click="increment"> +1 </button>
        </div>
    `);
}, san);

```

### 定义数据

使用 [data](https://github.com/baidu/san-composition/blob/master/docs/api.md#data) 方法来初始化组件的一个数据项：

```js
import san from 'san';
import { defineComponent, template, data } from 'san-composition';

const App = defineComponent(() => {
    template(/* ... */);
    const count = data('count', 1);
}, san);
```

`data` 的返回值是一个对象，包含get、set、merge、splice等方法。我们可以通过对象上的方法对数据进行获取和修改操作。

### 定义计算数据

使用 [computed](https://github.com/baidu/san-composition/blob/master/docs/api.md#computed) 方法来定义一个计算数据项：

```js
const App =  defineComponent(() => {
    template(/* ... */);

    const name = data('name', {
        first: 'Donald',
        last: 'Trump'
    });

    const fullName = computed('fullName',  function() {
        return name.get('first') + ' ' + name.get('last');
    });
}, san);
```


### 定义过滤器

使用 [filters](https://github.com/baidu/san-composition/blob/master/docs/api.md#filters) 方法来为组件添加过滤器：
 
```js
const App =  defineComponent(() => {
    template('<div> {{ count|triple }} </div>');

    const count = data('count', 1);
 
    filters('triple', value => value * 3);
}, san);
```


### 定义方法

使用 [method](https://github.com/baidu/san-composition/blob/master/docs/api.md#method) 来定义方法，我们强烈建议按照 `data` 和 `method` 根据业务逻辑就近定义：

```js
import san from 'san';
import { defineComponent, template, data, method } from 'san-composition';

const App = defineComponent(() => {
    template(/* html */`
        <div>
            <span>count: {{ count }} </span>
            <button on-click="increment"> +1 </button>
        </div>
	`);
    const count = data('count', 1);
    method('increment', () => count.set(count.get() + 1));
}, san);
```

### 生命周期钩子

下面的 [onAttached](https://github.com/baidu/san-composition/blob/master/docs/api.md#onAttached) 方法，为组件添加 attached 生命周期钩子：

```js
import san from 'san';
import {defineComponent, template, onAttached} from 'san-composition';

const App =  defineComponent(() => {
    template(/* ... */);
    onAttached(() => {
        console.log('onAttached');
    });
}, san);
```

生命周期钩子相关的 API 是通过在对应的钩子前面加上 on 命名的，所以它与组件的生命周期钩子一一对应。

| **Option API** | **组合式API中的Hook** |
| -------------- | --------------------- |
| construct      | onConstruct           |
| compiled       | onCompiled            |
| inited         | onInited              |
| created        | onCreated             |
| attached       | onAttached            |
| detached       | onDetached            |
| disposed       | onDisposed            |
| updated        | onUpdated             |
| error          | onError               |

**一个完整的例子**

下面的例子展示了如何使用 San 组合式 API 定义组件：

```js
import san from 'san';
import {
    defineComponent,
    template,
    data,
    computed,
    filters,
    watch,
    components,
    method,
    onCreated,
    onAttached
} from 'san-composition';

export default defineComponent(() => {
    // 定义模板
    template(/* html */`
        <div>
            <span>count: {{ count }} </span>
            <input type="text" value="{= count =}" />
            <div>double: {{ double }} </div>
            <div>triple: {{ count|triple }} </div>
            <button on-click="increment"> +1 </button>
            <my-child></my-child>
        </div>
    `);

    // 初始化数据
    const count = data('count', 1);

    // 添加方法
    method('increment', () => count.set(count.get() + 1));

    // 监听数据变化
    watch('count', newVal => {
        console.log('count updated: ', newVal);
    });

    // 添加计算数据
    computed('double', () => count.get() * 2);

    // 添加过滤器
    filters('triple', n => n * 3);

    // 定义子组件
    components({ 'my-child': defineComponent(() => template('<div>My Child</div>'), san) });

    // 生命周期钩子方法
    onAttached(() => {
        console.log('onAttached');
    });

    onAttached(() => {
        console.log('another onAttached');
    });

    onCreated(() => {
        console.log('onCreated');
    });
}, san);

```


## 进阶篇

组合式 API 使用的要点，在于 **按功能** 定义相应的数据、方法、生命周期运行逻辑等。如果在一个完整的定义函数里流水账般声明一整个组件，为用而用地使用组合式 API 是没有意义的。

本篇以一个简单的例子，通过两小节对组合式 API 的使用给予一些指导：

- [实现可组合](#实现可组合) 讲述如何将一个使用 class 声明的组件改造成使用组合式 API 实现
- [实现可复用](#实现可复用) 在上节基础上，讲述如何 **按功能** 拆分成多个函数并实现复用


### 实现可组合

假设我们要开发一个联系人列表，从业务逻辑上看，该组件具备以下功能：

1. 联系人列表，以及查看、收藏操作；
2. 收藏列表，以及查看、取消收藏操作；
3. 通过表单筛选联系人

首先，我们用 Class API 来实现：

```js
class ContactList extends san.Component {
    static template = /* html */`
         <div class="container">
            <div class="contact-list-filter">
                <s-icon type="search">
                <s-input on-change="changeKeyword"></s-input>
            </div>

            <div class="favorite-list">
                <h2>个人收藏</h2>
                <contact-list
                    data="{{favoriteList|filterList(keyword)}}"
                    on-open="onOpen"
                    on-favorite="onFavorite"
                />
            </div>

            <div class="contact-list">
                <h2>联系人</h2>
                <contact-list
                    data="{{contactList|filterList(keyword)}}"
                    on-open="onOpen"
                    on-favorite="onFavorite"
                />
            </div>
        </div>
    `;

    initData() {
        return {
            // 功能 1
            contactList: []
            // 功能 2
            favoriteList: [],
            // 功能 3
            keyword: ''
        };
    }

    filters: {
        filterList(item, keyword) {
            // ...
        }
    },

    static components = {
        's-icon': Icon,
        's-input': Input,
        's-button': Button,
        'contact-list': ContactListComponent,
    }

    attached() {
        this.getContactList();
        this.getFavoriteList();
    }

    // 功能 1
    getContactList() {
        // ...
    }

    // 功能 2
    getFavoriteList() {
        // ...
    }

    // 功能 1 & 2
    async onOpen(item) {
        // ...
    }

    // 功能 1 & 2
    async onFavorite(item) {
        // ...
    }

    // 功能 3
    changeKeyword(value) {
        this.data.set('keyword', value);
    }
}

```

随着组件功能的丰富，Class API 的逻辑会变得越来越发散，我们往往需要在多个模块中跳跃来阅读某个功能的实现，代码的可读性会变差。接下来，我们通过组合式 API 按照功能来组织代码：

```js
const ContactList = defineComponent(() => {
    template('/* ... */');
    components({
        's-icon': Icon,
        's-input': Input,
        's-button': Button,
        'contact-list': ContactListComponent,
    });

    // 功能 1 & 2
    method({
        onOpen: item => {/* ... */},
        onFavorite: item => {/* ... */}
    });

    filters('filterList', (item, keyword) => {
        // ...
    });

    // 功能 1
    const contactList = data('contactList', []);
    method('getContactList', () => {
        // ...
        contactList.set([/* ... */]);
    });
    onAttached(function () { this.getContactList(); });


    // 功能 2
    const favoriteList = data('favoriteList', []);
    method('getFavoriteList', () => {
        // ...
        favoriteList.set([/* ... */]);
    });
    onAttached(function () { this.getFavoriteList(); });
    

    // 功能 3
    const keyword = data('keyword', '');
    method('changeKeyword', value => {
        keyword.set(value);
    });    
}, san);
```

### 实现可复用

按照功能来组织的代码有时候逻辑代码块也会比较长，我们可以考虑对组合的逻辑进行一个封装：

```js
/**
 * @file utils.js
 */

import { ... } from 'san-composition';

// 功能 1
export const useContactList = () => {
    const contactList = data('contactList', []);
    method('getContactList', () => {
        // ...
        contactList.set([/* ... */]);
    });
    onAttached(function () { this.getContactList(); });
};

// 功能 2
export const useFavoriteList = () => {
    const favoriteList = data('favoriteList', []);
    method('getFavoriteList', () => {
        // ...
        favoriteList.set([/* ... */]);
    });
    onAttached(function () { this.getFavoriteList(); });
};


// 功能 3
export const useSearchBox = () => {
    const keyword = data('keyword', '');
    method('changeKeyword', value => {
        keyword.set(value);
    });    
};

// 该 hook 函数提供一个默认名字为 filterList 的过滤器，可以通过参数修改这个过滤器的名称
export const useFilterList = ({filterList = 'filterList'}) => {
    filters(filterList, (item, keyword) => {
        // ...
    });
};

```

另外，对于一些常用基础 UI 组件，我们也可以封装一个方法：

```js
export const useUIComponents = () => {
    components({
        's-button': Button,
        's-icon': Icon,
        's-input': Input
    });
};
```

我们对联系人列表组件再进行一下重构：

```js
import { useContactList, useFavoriteList, useSearchBox, useUIComponents, useFilterList } from 'utils.js';
const ContactList = defineComponent(() => {
    template('/* ... */');

    useUIComponents();

    components({
        'contact-list': ContactListComponent,
    });

    method({
        onOpen: item => {/* ... */},
        onFavorite: item => {/* ... */}
    });

    useFilterList();

    // 功能 1
    useContactList();

    // 功能 2
    useFavoriteList();

    // 功能 3
    useSearchBox();
}, san);
```

假设新的需求来了，我们需要一个新的组件，不展示收藏联系人：

```js
import { useContactList, useFavoriteList, useSearchBox, useUIComponents } from 'utils.js';
const ContactList = defineComponent(() => {
    // 模板当然也要做一些调整，这里省略了
    template('/* ... */');

    useUIComponents();

    components({
        'contact-list': ContactListComponent,
    });

    method({
        onOpen: item => {/* ... */},
        onFavorite: item => {/* ... */}
    });

    useFilterList();
    useContactList();
    useSearchBox();
}, san);
```

### this 的使用

在组合式 API 中我们不推荐使用 `this` ，它会造成一些混淆，但有时候可能不得不使用，这时候注意不要在对应的方法中使用箭头函数。

```js
defineComponent(() => {
    template(/* ... */);
    const count = data('count', 1);

    // 这里定义的方法不能使用剪头函数
    method('increment', function () {
        this.dispatch('increment:count', count.get());
    });
}, san);

```


## License

san-composition is [MIT licensed](./LICENSE).
