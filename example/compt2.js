/**
 * @file 组合式API，demo
 */
import san from 'san';
import {
    defineComponent,
    template,
    data,
    computed,
    messages,
    filters,
    watch,
    components,
    method,
    onCompiled,
    onInited,
    onCreated,
    onAttached,
    onDetached,
    onDisposed,
    onUpdated
} from '../index';

var Counter = defineComponent(() => {
    template('<u on-click="add">num: {{num}}</u>');

    const dataObj = data({
        num: 2
    });

    method({
        add() {
            dataObj.set('num', dataObj.get('num') + 1);
        }
    });
});

export default defineComponent(() => {
    template(`<div>
        <div>x-c</div>
        <x-c />
    </div>`);

    components({
        'x-c': Counter
    });
});
