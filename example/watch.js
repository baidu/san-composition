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

const App =  defineComponent(() => {
    template(`
        <div>
            <span>name: {{name}}</span>
            <button on-click="rename">rename</button>
            <br ><br >
            <span>company: {{company}}</span>
            <button on-click="hop">hop</button>
        </div>
    `);

    const info = data({
        company: 'baidu'
    });

    // Watch失效了啊？
    watch('company', function (value, e) {
        const company = info.get('company');
        console.log(`data changes, new company: ${company}`);
    });

    method('hop', () => {
        info.set('company', 'baidu~' + Math.random());
    });

    const nameData = data('name', 'myName');

    method('rename', function () {
        this.data.set('name', 'jinz~' + Math.random());
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