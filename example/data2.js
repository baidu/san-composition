/**
 * @file san composition api demo
 */
 import {
    defineComponent,
    template,
    data,
    components,
    computed,
    method,
}  from '../index';

const wrapper = document.createElement('div');
wrapper.id = 'sca-id';
document.body.appendChild(wrapper);


let Counter = defineComponent(() => {
    template('<u on-click="add">num: {{num}}</u>');

    const dataObj = data({
        num: 2
    });

    method({
        add() {
            dataObj.set('num', dataObj.get('num') + 1);
        }
    });
}, san);

let MyComponent = defineComponent(() => {
    components({
        'x-c': Counter
    });
    template('<div><x-c /></div>');
}, san);

let myComponent = new Counter();

let u = wrapper.getElementsByTagName('u')[0];

san.nextTick(function () {
    myComponent.dispose();
    document.body.removeChild(wrapper);
    console.log({wrapper});
});   

myComponent.attach(wrapper);
