/**
 * @file san composition api demo
 */
import {
    defineComponent,
    template,
    data,
    method,
}  from '../index';

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);


const App =  defineComponent(() => {
    template(/*html*/`
         <div>
            <div><strong>Data Function</strong></div>

             <span>count: {{ count }} </span>
             <input type="text" value="{= count =}"/>
             <div>name: {{ name }} </div>
             <div>company: {{ company }} </div>
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

    method({
        increment: () => {
            // 支持为空？
            console.log('info.get():', info.get());

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
