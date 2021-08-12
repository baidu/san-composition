/**
 * @file 组合式API，demo2
 */
import {Component, initData, computed, onAttached} from '@san-reactive/v2';
export default class App extends Component {
    static template = /*html*/`
        <div>
            <h1>响应式API</h1>
            
            <h2>1 简单变量</h2>
            <div>info.count: {{info.count}}</div>
            <div>double: {{double}}</div>
            
            <div>
                <button on-click="increment">测试</button>
            </div>

            <h2>1.1 Computed变量</h2>
            <div>showMsg: {{showMsg}}</div>
            <div>newNameX: {{newNameX}}</div>


            <h2>2 深层对象</h2>
            <div>info.deep.deeper.deepest.title: {{info.deep.deeper.deepest.title}}</div>
            <div>
                <button on-click="testExt">测试</button>
            </div>


            <h2>3.1 数组1</h2>
            <div>info.list1[0].title: {{info.list1[0].title}}</div>
            <div>
                <button on-click="testArr1">测试</button>
            </div>

            <h2>3.2 数组设置2</h2>
            <div>info.list2[0].title: {{info.list2[0].title}}</div>
            <div>
                <button on-click="testArr2">测试</button>
            </div>

            <h2>3.3 数组设置3</h2>
            <div>info.list3[0].title: {{info.list3[0].title}}</div>
            <div>
                <button on-click="testArr3">测试</button>
            </div>

            <h2>5 扩展对象</h2>
            <div>info.ext.deeper.deepest.title: {{info.ext.deeper.deepest.title}}</div>
            <div>
                <button on-click="setExt">测试</button>
            </div>
        </div>
    `;

    static computed = {
        double() {
            return this.data.get('info.count') * 2;
        },
        newNameX () {
            return '____' + this.data.get('name')
        }
    };

    initData() {
        return {
            hello: 'Hello',
            name: 'ref'
        }
    }

    setup(data) {
        const info = initData({
            name: 'Jinz',
            count: 1,
            ext: {
                title: 'erik'
            },
            list1: [
                {
                    title: 'haha'
                }
            ],
            list2: [
                {
                    title: 'haha'
                }
            ],
            list3: [
                {
                    title: 'haha'
                }
            ],
            deep: {
                deeper: {
                    deepest: {
                        title: 'jinz'
                    }
                }
            },
            ext: {}
        });

        const increment = () => {
            info.set('count', info.get('count') ? info.get('count') + 1 : 1);
        };

        onAttached(() => {
            console.log('onAttached!')
        });

        const testExt = () => {
        info.set('deep.deeper.deepest.title', info.get('deep.deeper.deepest.title') + 'haha');
        };

        const testArr1 = () => {
        info.set('list1[0].title', 'woca1~' + Date.now());
        };

        const testArr2 = () => {
        info.set('list2[0]', {
            title: 'woca2~' + Date.now()
        });
        };

        const testArr3 = () => {
        info.splice('list3', [0, 0, {
                title: 'woca3~' + Date.now()
            }]);
        };

        const setExt = () => {
        info.set('ext.deeper.deepest.title', 'deep set');
        };

        const showMsg = computed(() => {
            // return 'info.deep.deeper.deepest.title => ' + this.data.get('info.deep.deeper.deepest.title');
            return 'info.deep.deeper.deepest.title => ' + info.get('deep.deeper.deepest.title');
        });

        return {
            info,
            showMsg,
            increment,
            testExt,
            testArr1,
            testArr2,
            testArr3,
            setExt
        };
    }
}
