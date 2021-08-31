- Start Date: 2021-06-16
- Target Major Version: (1.x)
- Reference Issues: N/A
- Implementation PR: N/A

# 1. Summary

Composition API的思路受了React Hooks的影响，由Vue框架提出，它使得代码的共享和重用变得更为简单和便捷。对于San框架有一定的可借鉴意义：

## **1.1 Options API**  vs **Composition API**

1. Options API通过使用San单文件中data、method、computed、watch来定义属性和方法，共同处理页面逻辑；
2. Composition API根据逻辑相关性组织代码的，提高可读性和可维护性，基于函数组合的 API 更好的重用逻辑代码（替代容易发生命名冲突和数据来源不清的mixin）；
3. **Brief Summary**：
   1. 在逻辑组织和逻辑复用方面，Composition API是优于Options API；
   2. 因为Composition API几乎是函数，会有更好的类型推断；
   3. Composition API对 tree-shaking 友好，代码也更容易压缩；

先看一个Vue的例子：

```js
import {ref, computed} from 'vue';
function useCount() {
    let count = ref(10);
    let double = computed(() => {
        return count.value * 2;
    });

    const handleConut = () => {
        count.value = count.value * 2;
    };


    return {
        count,
        double,
        handleConut,
    };
}
```

调用useCount

```js
export default {
  name: 'App',
  setup() {
    const {count, double, handleConut} = useCount();
    return {count, double, handleConut};
  }
}
```



完整代码

```html
<template>
    {{count}} x 2 = {{double}}
    <div><button @click="handleConut"> Double </button></div>
</template>

<script>
import {ref, computed} from 'vue';
function useCount() {
    let count = ref(10);
    let double = computed(() => {
        return count.value * 2;
    });
    const handleConut = () => {
        count.value = count.value * 2;
    };
    return {
        count,
        double,
        handleConut,
    };
}
export default {
  name: 'App',
  // context包含3个参数，attrs、slots，emit
  //   context.attrs: 包含除props以外的参数,与vue2中的this.$attrs功能一致
  //   context.slots: 包含插槽，与this.$slots功能一致
  //   context.emit: 触发事件 (方法)，与this.$emit方法一致
  setup(props, context) {
    const {count, double, handleConut} = useCount();
    return {count, double, handleConut};
  }
}
</script>
```





## 1.2 setup什么时候触发

**在组件创建之前执行，props被解析，然后执行setup并将props传入方法，由于执行setup时组件实例尚未创建，所以setup内无法使用this，并且无法访问methods、watch、computed内的方法及属性。**

- setup内使用ref函数实现变量的响应式，并使用return返回变量，供给模板内使用；
- 使用ref方法定义变量后，返回的是一个对象，如果需要修改变量的值需要使用变量.value修改变量的值；
- 父组件将参数注入provide，子、孙组件使用inject，如果要确保注入的参数不被子组件修改，可以在注入时使用readonly避免子组件修改参数；



## 1.3 Reactive

reactive 这个api最重要的使用场景是在渲染期间使用，因为有依赖追踪，当响应式的state的值发生变化的时候，视图就会自动更新，在DOM中渲染某些东西通常是被视做“有副作用的”，为了根据reactive state来应用并自动应用副作用，我们可以使用watchEffect来实现。

```js
import { reactive, watchEffect } from 'san-reactive';

const state = reactive({
  count: 0
});

// watchEffect 会立即执行该函数，并将执行过程中用到的所有的响应式状态的属性作为依赖进行追踪
watchEffect(() => {
  document.body.innerHTML = `count is ${state.count}`
});
```

**reactive()  →  observe()  →  setupAccessControl()**



### 1.3.1 observe

- Vue.observable(obj)
- defineComponentInstance(Vue, {data: {$$state: obj}})

```js
import Vue from 'vue'
export function defineComponentInstance<V extends Vue = Vue>(
  Ctor: VueConstructor<V>,
  options: ComponentOptions<V> = {}
) {
  const silent = Ctor.config.silent
  Ctor.config.silent = true
  const vm = new Ctor(options)
  Ctor.config.silent = silent
  return vm
}
```



### 1.3.2 setupAccessControl

- defineAccessControl
  - setupAccessControl
  - proxy



## 1.4 San的setup

1. 把setup返回值，挂在data下



### 1.4.1 冲突和优先级的问题

![img](https://san.js.org/img/life-cycle.png)









# 2. Basic example

**San**

```html

<template>
  <div>
        <span>count: {{ count }} </span>
        <input type="text" value="{= count =}"/>
        <div>double: {{ double }} </div>
        <button on-click="increment"> +1 </button>
  </div>
</template>

<script>
  export default {
    setup(ctx) {
        const {reactive, watch, computed, onAttached, onCreated} = ctx;
        const data = reactive({
            count: 1
        });

        const increment = () => {
            let count = data.get('count');
            data.set('count', ++count);
        };

        watch('count', newVal => {
            console.log('count:', newVal);
        });

        computed({
            double() {
                return data.get('count') * 2;
            }
        });

        onAttached(() => {
            console.log('onAttached');
        });

        return {
            data,
            increment
        }
    });
 }
</script> 

```




# 3. Motivation

### 3.1 更好的代码组织和逻辑复用

1. 随着功能的增加，复杂组件的代码变得更难推理。尤其是当开发者在阅读不是他们自己写的代码时，这种情况会发生。根本原因是现有的API强迫按选项组织代码，但在某些情况下，按逻辑关注点组织代码更有意义；
2. 目前缺少一种简洁且低成本的机制来提取和重用多个组件之间的逻辑。



# 4. Detailed design

### 4.1 响应式状态

创建一个响应式的状态

```js
import { reactive } from 'san-reactive';

// state 现在是一个响应式的状态
const state = reactive({
  count: 0,
});
```



响应式状态的基本用例就是在渲染时使用它。因为有了依赖追踪，视图会在响应式状态发生改变时自动更新。在 DOM 当中渲染内容会被视为一种“副作用”：程序会在外部修改其本身 (也就是这个 DOM) 的状态。我们可以使用 `watchEffect` API 应用基于响应式状态的副作用，并*自动*进行重应用。

```js
import { reactive, watchEffect } from 'san-reactive';

const state = reactive({
  count: 0,
})

watchEffect(() => {
  document.body.innerHTML = `count is ${state.count}`
})
```



### 4.2 Ref vs. Reactive

可以理解的是，用户会纠结用 `ref` 还是 `reactive`。而首先你要知道的是，这两者你都必须要了解，才能够高效地使用组合式 API。只用其中一个很可能会使你的工作无谓地复杂化，或反复地造轮子。

使用 `ref` 和 `reactive` 的区别，可以通过如何撰写标准的 JavaScript 逻辑来比较：

```js
// 风格 1: 将变量分离
let x = 0;
let y = 0;

function updatePosition(e) {
  x = e.pageX;
  y = e.pageY;
}

// --- 与下面的相比较 ---

// 风格 2: 单个对象
const pos = {
  x: 0,
  y: 0,
};

function updatePosition(e) {
  pos.x = e.pageX;
  pos.y = e.pageY;
}
```

- 如果使用 `ref`，我们实际上就是将风格 (1) 转换为使用 ref (为了让基础类型值具有响应性) 的更细致的写法。
- 使用 `reactive` 和风格 (2) 一致。我们只需要通过 `reactive` 创建这个对象。

**而只使用 `reactive` 的问题是，使用组合函数时必须始终保持对这个所返回对象的引用以保持响应性。这个对象不能被解构或展开：**

```js
// 组合函数：
function useMousePosition() {
  const pos = reactive({
    x: 0,
    y: 0,
  });

  // ...
  return pos;
}

// 消费者组件
export default {
  setup() {
    // 这里会丢失响应性!
    const { x, y } = useMousePosition();
    return {
      x,
      y,
    };

    // 这里会丢失响应性!
    return {
      ...useMousePosition(),
    };

    // 这是保持响应性的唯一办法！
    // 你必须返回 `pos` 本身，并按 `pos.x` 和 `pos.y` 的方式在模板中引用 x 和 y。
    return {
      pos: useMousePosition(),
    };
  },
}
```

[`toRefs`](https://vue3js.cn/vue-composition/api.html#torefs) API 用来提供解决此约束的办法——它将响应式对象的每个 property 都转成了相应的 ref。

```js
function useMousePosition() {
  const pos = reactive({
    x: 0,
    y: 0,
  });

  // ...
  return toRefs(pos);
}

// x & y 现在是 ref 形式了!
const { x, y } = useMousePosition()
```

总结一下，一共有两种变量风格：

1. 就像你在普通 JavaScript 中区别声明基础类型变量与对象变量时一样区别使用 `ref` 和 `reactive`。我们推荐你在此风格下结合 IDE 使用类型系统；
2. 所有的地方都用 `reactive`，然后记得在组合函数返回响应式对象时使用 `toRefs`。这降低了一些关于 ref 的心智负担，但并不意味着你不需要熟悉这个概念。

在这个阶段，我们认为现在就强制决定 `ref` vs. `reactive` 的最佳实践还为时过早。我们建议你对以上两种方式都进行尝试，选择与你的心智模型更加配合的风格。我们将持续收集周边生态中的用户反馈，并最终在这个问题上提供更明确、更统一的实践指导建议。

> https://vue3js.cn/vue-composition/#ref-vs-reactive

# 5. Drawbacks

### 5.1 返回语句冗长

一些用户会顾虑 `setup()` 的返回语句变得冗长，像是重复劳动。

我们相信明确的返回语句对可维护性是有益的。它使我们能够显式地控制暴露给模板的内容，并作为起点，追踪模板中某个 property 在组件哪里被定义的。

有些建议希望自动暴露 `setup()` 中声明的变量，使 `return` 语句变为可选的。再次重申，我们不认为这应该是默认的行为，因为它违背了标准 JavaScript 的直觉。不过还是有一些方法可以让用户侧的工作变少：

- 开发 IDE 插件自动将 `setup()` 中定义的变量插入到返回值语句中；
- 开发 Babel 插件来隐式地生成并插入 `return` 语句。



### 5.2 更多的灵活性来自更多的自我克制

许多用户指出，虽然组合式 API 在代码组织方面提供了更多的灵活性，但它也需要开发人员更多地自我克制来 “正确地完成它”。也有些人担心 API 会让没有经验的人编写出面条代码。换句话说，虽然组合式 API 提高了代码质量的上限，但它也降低了下限。

我们在一定程度上同意这一点。但是，我们认为：

1. **提升上界的收益远远大于降低下界的损失；**
2. 通过适当的文档和社区指导，我们可以有效地解决代码组织问题。

任何 JavaScript 程序都是从一个入口文件开始的 (将它想象为程序的 `setup()`)。我们根据逻辑关注点将程序分解成函数和模块来组织它。**组合式 API 使我们能够对San组件代码做同样的事情。**换句话说，编写有组织的 JavaScript 代码的技能直接转化为了编写有组织的 San 代码的技能。



> 参考资料

- https://composition-api.vuejs.org/zh/
- https://v3.cn.vuejs.org/api/composition-api.html
- https://www.youtube.com/watch?v=6HUjDKVn0e0
- https://zhuanlan.zhihu.com/p/68477600
- https://vue3js.cn/vue-composition/
