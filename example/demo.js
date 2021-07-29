/**
 * @file 容器组件
 * @author jinzhan <jinzhan@baidu.com>
 */

 import {Component, reactive, onAttached} from '@/san-reactive';
 import './app.less';
 
 export default class App extends Component {
     static template = /*html*/`
         <div>
             <h1>info.count: {{info.count}}</h1>
             <div>
                 <button on-click="increment"> Increment Count </button>
             </div>
         </div>
     `;
     setup() {
         const info = reactive({
             count: 1
         });
 
         const increment = () => {
             info.count = info.count + 1;
         };
 
         onAttached(() => {
             console.log('onAttached!')
         });
 
         return {
             info,
             increment
         };
     }
 }
 