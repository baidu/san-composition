import {defineComponent, template, data, onAttached} from '../index';
import san from 'san/dist';

const MyComponent = defineComponent(context => {
    template`
    <div>
        <p>name: {{name}}</p>
        <p>email: {{email}}</p>
    </div>`;
    template(`
        <div>
            <p>name: {{name}}</p>
            <p>email: {{email}}</p>
        </div>`);

    const name = data('name', 'baidu');
    name.apply(val => {
        return val + ' 2021';
    });
    data('email', 'xxx@baidu.com');
    onAttached(() => {
        console.log('attached!');
    });
}, san);

const myComponent = new MyComponent();
myComponent.attach(document.body);
myComponent.dispose();
