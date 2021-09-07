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

            <div><span title="{{msg}}">{{msg}}</span></div>
            <div><span>{{msg2}}</span></div>
        </div>
    `);

    const info = data({
        first: 'first',
        last: 'last',
        email: 'name@name.com'
    });

    // TODO: issue2，computed支持对象的形式，另外，this.data可以使用，但不推荐使用
    const computedInfo = computed({
        msg() {
            return this.data.get('name') + '(' + info.get('email') + ')';
        },
        name() {
            return info.get('first') + ' ' + info.get('last');
        },
        more() {
            return computedInfo.get('msg') + ' | ' + computedInfo.get('name');
        }
    });


}, san);

(new App()).attach(wrapper);
