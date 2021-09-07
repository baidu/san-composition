/**
 * @file san composition api demo
 */
import {
    defineComponent,
    template,
    data,
    computed,
    method,
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
             <div>name: {{ name }} </div>
             <div>company: {{ company }} </div>
             <div>deepCount: {{deepCount}}</div>
             <div>deeperCount: {{deeperCount}}</div>
             <button on-click="increment"> +1 </button>
             <button on-click="decrement"> -1 </button>
         </div>
     `);

    // 处理数据
    const count = data('count', 1);

    const info = data({
        name: 'jinz',
        company: 'baidu'
    });

    const extraInfo = data('extra', {
        sex: 'male',
        country: 'China'
    });

    const computedData = computed({
        'deepCount': () => {
            return count.get() + ' ===> ';
        },
        'deeperCount': () => {
            return computedData.get('deepCount')  + ' ===> ';
        }
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
