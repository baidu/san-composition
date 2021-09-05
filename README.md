# san-composition

Composition API的目标是让代码的共享和重用变得更为简单和便捷，这个概念由Vue框架提出（受React Hooks影响），它对于San框架有一定的可借鉴意义。

## 1. Options API  vs Composition API

1. Options API通过使用San单文件中data、method、computed、watch来定义属性和方法，共同处理页面逻辑；
2. Composition API则是将属性转换为对应的函数，通过逻辑相关性来组织代码，从而实现更好的代码复用，提高可读性和可维护性。


## 2. Basic example

```js
import san from 'san';
import {
    defineComponent,
    template,
    data,
    computed,
    messages,
    filters,
    watch,
    components,
    method,
    onCompiled,
    onInited,
    onCreated,
    onAttached,
    onDetached,
    onDisposed,
    onUpdated
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

    onAttached(() => {
        console.log('onAttached');
    });

    onAttached(() => {
        console.log('onAttached1');
    });

    components({
        'my-child': defineComponent({
            template: `<div>My Child</div>`
        })
    });

    onCreated(() => {
        console.log('onCreated');
    });
}, san);

```

## 3. Motivation

### 1. 更好的代码组织和逻辑复用

1. 随着功能的增加，复杂组件的代码变得更难推理。尤其是当开发者在阅读不是他们自己写的代码时，这种情况会发生。根本原因是现有的API强迫按选项组织代码，但在某些情况下，按逻辑关注点组织代码更有意义；
2. 目前缺少一种简洁且低成本的机制来提取和重用多个组件之间的逻辑。

### 2. 关于 setupComponent 的 return

1. 我们将 option API全部转换为了函数方法（composition API），如果再增加额外的return，会导致返回语句变得冗长；
2. 返回语句对可维护性有一定的帮助，但经过权衡，我们选择不 return。



