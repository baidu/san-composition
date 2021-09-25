# san-composition

[![NPM version](http://img.shields.io/npm/v/san-composition.svg?style=flat-square)](https://npmjs.org/package/san-composition)
[![License](https://img.shields.io/github/license/baidu/san-composition.svg?style=flat-square)](https://npmjs.org/package/san-composition)


随着业务的不断发展，前端项目往往变得越来越复杂，过去我们使用 options 定义组件的方式随着功能的迭代可读性可能会越来越差，当我们为组件添加额外功能时，通常需要修改（initData、attached、computed等）多个代码块；而在一些情况下，按逻辑来组织代码显然更有意义，也更方便细粒度的代码复用。

san-composition 提供一组与定义组件 options 的 key 对应的方法来定义组件的属性和方法，让开发者可以通过逻辑相关性来组织代码，从而提高代码的可读性和可维护性。

- [安装](#安装)
- [基础用法](#基础用法)
- [进阶篇](#进阶篇) 
- [API](https://github.com/baidu/san-composition/blob/master/docs/api.md)
## 安装

**NPM**

```
npm install san-composition
```

## 基础用法

在定义一个组件的时候，我们通常需要定义模板、初始化数据、定义方法、添加生命周期钩子，在使用组合式 API 定义组件的时候，我们不再使用一个大的 options 对象或者是使用 Class API  添加一大堆属性和方法，而是用各个 option 对应的方法来解决组件的各种属性、方法的定义。

> 注意：defineComponent 所有的组合式 API 方法都只能在 defineComponent 方法的第一个函数参数中执行。

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
### 实现可组合

假设我们要开发一个联系人列表，这个列表包含了联系人的查看、修改、删除、收藏等功能。这里首先使用 Class API 来开发，我们的组件随着功能的丰富逐渐变大，慢慢它的逻辑会变得越来越发散，代码的可读性会变差。

从业务逻辑上看，该组件具备以下功能：

1. 联系人/收藏的联系人的列表，包含：修改、删除、查看操作；
2. 通过表单筛选联系人；
3. 模态框的显示和隐藏，确认和取消；

```js
class ContactList extends san.Component {
    static template = /* html */`
         <div class="contact-list">
            <div class="contact-list-filter">
                <s-input-search on-change="filterInputChange"></s-input-search>
            </div>

            <div class="empty-tip" if="!contactList || contactList.length === 0">
                联系人列表空空如也
            </div>

            <div s-if="favoriteList && favoriteList.length > 0">
                <h3>收藏联系人</h3>
                <c-list
                    list="{{favoriteList}}"
                    on-edit="onEdit"
                    on-open="onOpen"
                    on-remove="onRemove"
                    on-favorite="onFavorite"
                />
            </div>

            <div 
                class="container contact-list-container"
                s-if="normalList && normalList.length > 0">
                <h3 s-if="favoriteList && favoriteList.length > 0">全部联系人</h3>
                <c-list
                   list="{{normalList}}"
                    on-edit="onEdit"
                    on-open="onOpen"
                    on-remove="onRemove"
                    on-favorite="onFavorite"
                />
            </div>

            <s-modal
                title="修改联系人" 
                visible="{=isVisible=}"
                on-confirm="handleModalConfirm" on-cancel="handleModalCancel">
                <s-input value="{=contactListName=}" />
                <!--.....-->
            </s-modal>
        </div>
    `;

    static computed = {
        favoriteList() {
            // 功能 1
            // ...
        },
        normalList() {
            // 功能 1
            // ...
        },
        filterList() {
            // 功能 2
            // ...
        }
    };

    initData() {
        return {
            // 功能 1 & 3
            isVisible: false,
            // 功能 3
            contactListName: '',
        };
    }

    static components = {
        's-alert': Alert,
        's-avatar': Avatar,
        's-badge': Badge,
        's-button': Button,
        's-card': Card,
        's-dropdown': Dropdown,
        's-form': Form,
        's-icon': Icon,
        's-input': Input,
        's-input-search': Input.Search,
        'c-list': ListComponent,
    }

    // 功能 1
    attached() {
        this.getContactList();
    }

    // 功能 2
    filterInputChange(filterInput) {
        // ...
    }

    // 功能 1
    async getContactList() {
        // ...
    }
    // 功能 1
    async onOpen({ item }) {
        // ...
    }

    // 功能 1
    async onRemove(e) {
        // ..
    }

    // 功能 1
    async onFavorite(e) {
        // ...
    }

    // 功能 1
    onEdit(e) {
        // ...
    }
    // 功能 3
    async handleModalConfirm() {
        // ..
        this.data.set('isVisible', false);
    }
    // 功能 3
    handleModalCancel() {
        this.data.set('isVisible', false);
    }
}

```



接下来，我们通过组合式 API 按照功能来组织代码：

```js
const ContactList = defineComponent(() => {
    template('/* ... */');
    components({
        's-alert': Alert,
        's-avatar': Avatar,
        's-badge': Badge,
        's-button': Button,
        's-card': Card,
        's-dropdown': Dropdown,
        's-form': Form,
        's-icon': Icon,
        's-input': Input,
        's-input-search': Input.Search,
        'c-list': ListComponent,
    });

    const contactList = data('contactList', []);
    const visibility = data('isVisible', false);

    // 功能 1
    const favoriteList = computed('favoriteList', () => contactList.get().filter(/* ... */));
    const normalList = computed('normalList', () => contactList.get().filter(/* ... */));
    method({
        getContactList: () => {/* ... */},
        onOpen: e => {/* ... */},
        onRemove: e => {/* ... */},
        onFavorite: e => {/* ... */},
        onEdit: e => visibility.set(true)
    });

    onAttached(function () { this.getContactList(); });


    // 功能 2
    const filterList = computed('filterList', () => contactList.get().filter(/* ... */));
    method('filterInputChange', filterInput => {
        // do something with 'filterInput'
    });


    // 功能 3
    method('handleModalConfirm', filterInput => {
        // ...
        visibility.set(false);
    });

    method('handleModalCancel', filterInput => {
        // ...
        visibility.set(false);
    });
}, san);
```



### 实现可复用

假设，我们需要再开发一个类似的联系人列表组件，该组件只支持查看，不支持修改和删除；那么，我们可以考虑对组合式 API 进行一个封装：

```js
/**
 * @file utils.js
 */

import { ... } from 'san-composition';

// 功能 1
export const useList = (contactList, visibility) => {
    const favoriteList = computed('favoriteList', () => contactList.get().filter(/* ... */));
    const normalList = computed('normalList', () => contactList.get().filter(/* ... */));
    method({
        getContactList: () => {/* ... */},
        onOpen: e => {/* ... */},
        onRemove: e => {/* ... */},
        onFavorite: e => {/* ... */},
        onEdit: e => visibility && visibility.set(true)
    });
};

// 功能 2
export const useFilterList = () => {
    const filterList = computed('filterList', () => contactList.get().filter(/* ... */));
    method('filterInputChange', filterInput => {
        // ...
    });
};


// 功能 3
export const useModel = visibility => {
    method('handleModalConfirm', filterInput => {
        // ...
        visibility.set(false);
    });

    method('handleModalCancel', filterInput => {
        // ...
        visibility.set(false);
    });
};

// 对于一些基础组件，我们也可以封装一个方法，减少重复代码
export const useComponents = () => {
    components({
        's-alert': Alert,
        's-avatar': Avatar,
        's-badge': Badge,
        's-button': Button,
        's-card': Card,
        's-dropdown': Dropdown,
        's-form': Form,
        's-icon': Icon,
        's-input': Input,
        's-input-search': Input.Search
    });
};

```

重构之前的组件：

```js
import { useList, useFilterList, useModel, useComponents } from 'utils.js';
const ContactList = defineComponent(() => {
    template('/* ... */');

    useComponents();

    components({
        'c-list': ListComponent,
    });

    const contactList = data('contactList', []);
    const visibility = data('isVisible', false);

    // 功能 1
    useList(contactList, visibility);

    // 功能 2
    useFilterList();

    // 功能 3
    useModel(visibility);
}, san);

```

创建一个类似的组件，但去掉联系人的编辑功能：

```js
import { useList, useFilterList, useModel, useComponents } from 'utils.js';
const ContactList = defineComponent(() => {
    // 当然，模板要做一些调整，这里省略了...
    template('/* ... */');

    useComponents();

    components({
        'c-list': ListComponent,
    });

    const contactList = data('contactList', []);

    // 功能 1
    useList(contactList);

    // 功能 2
    useFilterList();
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
