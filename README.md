# san-composition

[![NPM version](http://img.shields.io/npm/v/san-composition.svg?style=flat-square)](https://npmjs.org/package/san-composition)
[![License](https://img.shields.io/github/license/baidu/san-composition.svg?style=flat-square)](https://npmjs.org/package/san-composition)


随着业务的不断发展，前端项目往往变得越来越复杂，过去我们使用 options 定义组件的方式随着功能的迭代可读性可能会越来越差，当我们为组件添加额外功能时，可能需要修改（initData、attached、computed等）多个代码块；显然，在一些情况下按逻辑来组织代码更有意义，也使得更细粒度的代码复用成为可能。

san-composition 提供一组与定义组件 options 的 key 对应的方法来定义组件的成员属性和方法，让开发者可以通过逻辑相关性来组织代码，从而提高代码的可读性和可维护性。

## 安装

**NPM**

```
npm install san-composition
```

## 基础用法

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
    template(/*html*/`
        <div>
            <span>count: {{ count }} </span>
            <input type="text" value="{= count =}"/>
            <div>double: {{ double }} </div>
            <div>triple: {{ count|triple }} </div>
            <button on-click="increment"> +1 </button>
            <button on-click="decrement"> -1 </button>
            <my-child></my-child>
        </div>
    `);

    // 处理数据
    const count = data('count', 1);
    count.set(100);

    // 处理上下文
    method({
        increment: () => {
            console.log('incrementing');
            count.set(count.get() + 1);
        },
        decrement: () => {
            count.set(count.get() - 1);
        }
    });

    watch('count', newVal => {
        console.log('count updated~', newVal);
    });

    computed({
        double() {
            const name = this.data.get('name');
            return name + ' got ' +  count.get() * 2;
        }
    });

    filters({
        triple(val) {
            return val * 3;
        }
    });

    components({
        'my-child': defineComponent({
            template: `<div>My Child</div>`
        })
    }, san);

    onAttached(() => {
        console.log('onAttached');
    });

    onAttached(() => {
        console.log('onAttached1');
    });

    onCreated(() => {
        console.log('onCreated');
    });
}, san);

```
### 声明模板



### 声明方法



### 操作数据



### 生命周期钩子



## 进阶篇

## API

完整的 API 详见：[API](https://github.com/jinzhan/san-composition/blob/master/docs/api.md)

