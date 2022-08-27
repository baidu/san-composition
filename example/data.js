/**
 * @file san composition api demo
 */
import {
    defineComponent,
    template,
    data,
    computed,
    method,
    onAttached,
}  from '../index';

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);


const App =  defineComponent(() => {
    template(/*html*/`
         <div>
            <div><strong>Data Function</strong></div>

             <div>count: {{ count }} </div>
             <div>newCount: {{ newCount }} </div>
             <input type="text" value="{= count =}"/>
             <div>name: {{ info.name }} </div>
             <div>company: {{ info.company }} </div>
             <div>deepCount: {{deepCount}}</div>
             <div>deeperCount: {{deeperCount}}</div>
             <button on-click="increment"> +1 </button>
             <button on-click="decrement"> -1 </button>

             <ul>
                <li s-for="i in state">i - {{i}}</li>
                <li s-for="j in astate.data">j - {{j}}</li>
             </ul>
             <button on-click="updateState">updateState</button>
         </div>
     `);

    // 处理数据
    const count = data('count', 1);
    const deepCount = computed('deepCount', () => count.get() + ' ===> ');
    computed('deeperCount', () => deepCount.get() + ' ===> ');

    const info = data('info', {
        name: 'jinz',
        company: 'baidu'
    });

    const state = data('state', [0, 1, 2, 3, 4]);
    const aState = data('astate', {data: [0, 1, 2, 3, 4]});
    method('updateState', () => {
        state.pop();
        aState.pop('data');
    })

    const extraInfo = data('extra', {
        sex: 'male',
        country: 'China'
    });

    method({
        increment: () => {
            // 支持为空
            console.log('info.get():', info.get()); // => {name: 'jinz', company: 'baidu'}

            console.log('extraInfo.get():', extraInfo.get());

            // 支持对象属性
            console.log('extraInfo.get(\'sex\')', extraInfo.get('sex'));

            count.set(count.get() + 1);
        },
        decrement: () => {
            count.set(count.get() - 1);
        }
    });
}, san);

(new App()).attach(wrapper);

let DataSetAfterDisposed = defineComponent(context => {
    template('<u>num is {{num}}</u>');

    let d = data('num', 10);

    onAttached(() => {
        setTimeout(() => {
            context.data('num').set(50);
            console.log(d.get());
        }, 1000);
    });
}, san);

(function () {
    let myComponent = new DataSetAfterDisposed();
    myComponent.attach(wrapper);
    myComponent.dispose();
})();
