/**
 * @file san composition api demo
 */
import {
    defineComponent,
    template,
    data,
    filters
}  from '../index';

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);


const App =  defineComponent(() => {
    template(`
        <div>triple count: {{ count|tripleAndAdd(100)}} </div>
    `);

    const count = data('count', 1);
 
    filters('tripleAndAdd', (value, num) => {
        console.log({num});
        return value * 3 + num;
    });
}, san);

(new App()).attach(wrapper);

