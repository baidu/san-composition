/**
 * @file 组合式API，demo3
 */

 import {Component} from '@/san-reactive';
 
 export default class App extends Component {
    static template = /*html*/`
            <div>
                <span>count: {{ count }} </span>
                <input type="text" value="{= count =}"/>
                <div>double: {{ double }} </div>
                <div>triple: {{ triple }} </div>
                <button on-click="increment"> +1 </button>
                <button on-click="decrement"> -1 </button>
            </div>
        `;

        setup(context) {
            const {reactive, watch, computed, onAttached, onCreated} = context;
            const data = reactive({
                count: 1,
                triple: 3
            });
    
            const increment = () => {
                let count = data.get('count');
                data.set('count', ++count);
                data.set('triple', count * 3);
            };

            const decrement = () => {
                let count = data.get('count');
                data.set('count', --count);
                data.set('triple', count * 3);
            };

            watch('count', newVal => {
                console.log('count:', newVal);
            });

            computed({
                double() {
                    return data.get('count') * 2;
                }
            });

            onAttached(() => {
                console.log('onAttached');
            });

            onAttached(() => {
                console.log('onAttached1');
            });

            onCreated(() => {
                console.log('onCreated');
            });

            return {
                increment,
                decrement
            }
        }
 }
 