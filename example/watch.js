/**
 * @file san composition api demo
 */
import {
    defineComponent,
    template,
    data,
    method,
    watch
}  from '../index';

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);

const App =  defineComponent(context => {
    template(`
        <div>
            <div><strong>Watch Function</strong></div>
            <span>name: {{name}}</span>
            <button on-click="rename">rename</button>
            <br ><br >
            <span>company: {{company}}</span>
            <button on-click="hop">hop</button>
        </div>
    `);

    const info = data('company', 'baidu');

    watch('company', function (value, e) {
        const company = info.get();
        console.log(`data changes, new company: ${company}, val: ${value}`);
        console.log({e});
    });

    method('hop', () => {
        info.set('baidu~' + Math.random());
    });

    const nameData = data('name', 'myName');

    method('rename', function () {
        context.data.set('name', 'jinz~' + Math.random());
        // info.set('name', 'jinz~' + Math.random());
    });

    watch('name', function (value, e) {
        const name = nameData.get();
        console.log(`data changes, got new name: ${name}`);
    });
}, san);


let myComponent = new App();

myComponent.data.set('company', 'iqiyi');

myComponent.attach(wrapper);
