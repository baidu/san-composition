/**
 * @file 组合式API，demo4
 */

import {defineComponent} from 'san';
import {
    setupComponent,
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
} from '../src';

export default setupComponent(() => {
    template(/*html*/`
        <div>
            <span>count: {{ count }} </span>
            <input type="text" value="{= count =}"/>
            <div>double: {{ double }} </div>
            <div>triple: {{ count|triple }} </div>
            <button on-click="increment"> +1 </button>
            <button on-click="decrement"> -1 </button>
            <my-child></my-child>
            
            <br/>

            <div>{{name}}</div>
            <div>{{company}}</div>
            <button on-click="baidu"> baidu </button>
            <button on-click="tencent"> tencent </button>
        </div>
    `);

    // 处理数据
    const count = data('count', 1);

    const info = data({
        name: 'jinz',
        company: 'baidu'
    });

    method({
        tencent() {
            info.set({
                name: 'liub',
                company: 'tencent'
            });
        },
        baidu() {
            info.set('name', 'jinz');
            info.set('company', 'baidu');
        }
    });

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
            return count.get() * 2;
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
});
