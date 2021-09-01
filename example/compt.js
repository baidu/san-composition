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
             <div>{{extra}}</div>
             <div>{{usrInfo}}</div>
             <button on-click="baidu"> baidu </button>
             <button on-click="tencent"> tencent </button>
             <button on-click="assign"> assign </button>
         </div>
     `);

    // 处理数据
    const count = data('count', 1);

    const info = data({
        name: 'jinz',
        company: 'baidu'
    });

    method({
        baidu() {
            info.set('name', 'jinz');
            info.set('company', 'baidu');
        },

        tencent() {
            info.set({
                name: 'liub',
                company: 'tencent'
            });
        },

        assign() {
            info.assign({
                name: 'yuxin',
                company: 'tencent',
                extra: 'boy'
            });
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
            const name = this.data.get('name');
            return name + ' got ' + count.get() * 2;
        },
        usrInfo() {
            const {name, company} = info.get();
            return `name: ${name}   /   company: ${company}`;
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
        console.log('another onAttached...');
    });

    onCompiled(() => {
        console.log('onCompiled');
    });

    onInited(() => {
        console.log('onInited');
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
