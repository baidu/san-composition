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

    // 虽然不推荐用this，但是内部的this还是支持的
    const msg = computed('msg', function () {
        return this.data.get('name') + '(' + info.get('email') + ')';
    });

    const more = computed('more', function () {
        return msg.get() + ' | ' + name.get();
    });
}, san);

(new App()).attach(wrapper);
