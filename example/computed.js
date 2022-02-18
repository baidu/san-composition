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


const App =  defineComponent(context => {
    template(`
        <div>            
            <div><strong>Computed Function</strong></div>
            <div><span>info.first: {{info.first}}</span></div>
            <div><span>name: {{name}}</span></div>
            <div><span>msg: {{msg}}</span></div>
            <div><span>more: {{more}}</span></div>
        </div>
    `);

    const info = data('info', {
        first: 'first',
        last: 'last',
        email: 'name@name.com'
    });

    const name = computed('name', function () {
        return info.get('first') + ' ' + info.get('last');
    });

    // 使用 context 替代内部的 this
    const msg = computed('msg',  () => {
        return context.data.get('name')  + '(' + info.get('email') + ')';
    });

    const more = computed('more', function () {
        return msg.get() + ' | ' + name.get();
    });
}, san);

(new App()).attach(wrapper);
