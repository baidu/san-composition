import {defineComponent, template, data, onAttached} from '../index';
import san from 'san/dist';

const MyComponent = defineComponent<{
    name: string;
    email: string;
    age: number;
}>(context => {

    template`
    <div>
        <p>name: {{name}}</p>
        <p>email: {{email}}</p>
        <p>age: {{age}}</p>
    </div>`;
    template(`
        <div>
            <p>name: {{name}}</p>
            <p>email: {{email}}</p>
        </div>`);


    // data
    const name = data<string>('name', 'baidu');
    let nameVal = name.get();

    const person = data<{name:string;age:number;}>('person', {name: 'baidu', age: 23});
    let pNameVal = person.get('name');

    person.set('age', 10);

    person.merge({age: 23});

    // person.merge('name', {age: 23}); error
    // name.merge({}); // error

    name.apply(val => {
        return val + ' 2021';
    });

    data('email', 'xxx@baidu.com');

    onAttached(() => {
        console.log('attached!');
    });
}, san);

const myComponent = new MyComponent({
    data: {
        age: 18
    }
});

let email = myComponent.data.get('email');
myComponent.attach(document.body);
myComponent.dispose();
