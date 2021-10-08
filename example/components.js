/**
 * @file san composition api demo
 */
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
} from '../index';


const Counter = defineComponent(() => {
    template('<u on-click="add">num: {{num}}</u>');

    const num = data('num', 2);

    method({
        add() {
            num.set(num.get() + 1);
        }
    });
}, san);

const Line = defineComponent(() => {template(`
    <div style="padding: 20px 0;">-------------------</div>
`)}, san);


const MyComponent = defineComponent(() => {
    template(`
        <div>
            <div><span title="{{msg}}">{{msg}}</span></div>
            <div><span>{{msg2}}</span></div>
        </div>
    `);

    const info = data('info', {
        first: 'first',
        last: 'last',
        email: 'name@name.com'
    });

    const name = computed('name', () => {
        return info.get('first') + ' ' + info.get('last');
    });

    const msg = computed('msg', () => {
        return name.get() + '(' + info.get('email') + ')';
    });
}, san);

const App =  defineComponent(() => {
    template(/*html*/`
         <div>
             <x-computed />
             <x-line />
             <x-c />
             <x-line />
             <span>count: {{ count }} </span>
             <input type="text" value="{= count =}"/>
             <div>double: {{ double }} </div>
             <div>triple: {{ count|triple }} </div>
             <button on-click="increment"> +1 </button>
             <button on-click="decrement"> -1 </button>
             <my-child></my-child>
             <x-line />
             <div>{{info.name}}</div>
             <div>{{info.company}}</div>
             <div>{{info.extra}}</div>
             <div>{{info.usrInfo}}</div>
             <button on-click="baidu"> baidu </button>
             <button on-click="tencent"> tencent </button>
             <button on-click="assign"> assign </button>

             <x-line />

             <a><span title="{{projects[0].author.email}}">projects[0].author.email: {{projects[0].author.email}}</span></a>
         </div>
     `);

    let oldEmail = 'errorrik@gmail.com';
    const projects = data('projects', [
        {
            name: 'etpl',
            author: {
                email: oldEmail,
                name: 'errorrik'
            }
        }
    ]);

    // TODO: get方法的实现
    // console.log("projects.get('projects[0].author.email'):", projects.get('projects[0].author.email'));

     components({
        'x-c': Counter,
        'x-line': Line,
        'x-computed': MyComponent
    });

    // 处理数据
    const count = data('count', 1);

    const info = data('info', {
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

        // TODO: 方法待实现
        // assign() {
        //     info.assign({
        //         name: 'yuxin',
        //         company: 'tencent',
        //         extra: 'boy'
        //     });
        // }
    });

    // Error: 不能在非组合 API 上下文中 set
    // count.set(100);

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

    watch('count', (oldVal, newVal) => {
        console.log('count updated~', {oldVal, newVal});
    });

    computed('double', function () {
        const name = info.get('name');
        return name + ' got ' + count.get() * 2;
    });

    computed('usrInfo', function () {
        const {name, company} = info.get();
        return `name: ${name}   /   company: ${company}`;
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
        'my-child': san.defineComponent({
            template: '<div>My Child</div>'
        })
    });

    onCreated(() => {
        console.log('onCreated');
    });
}, san);

(new App()).attach(document.getElementById('app'));
