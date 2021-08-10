/**
 * 解决数组的响应式问题
*/
const arrayProto = Array.prototype;
// Object.create(obj) 创建一个新对象，并且使用现有对象obj作为新对象的__proto__
const arrayMethods = Object.create(arrayProto);

const originArrayMethods = [
    'push',
    'pop',
    'unshift',
    'shift',
    'splice',
    'sort',
    'reverse'
];

originArrayMethods.forEach(method => {
    // 缓存原始方法
    const original = arrayProto[method];
    Object.defineProperty(arrayMethods, method, {
        value(...args) {
            // args是调用原型方法时传入的参数
            console.log('this', this) // this指向属性所属对象
            // ... // 在这里面执行监听变化的操作
            return original.apply(this, args)
        }
    })
});

export default arrayMethods;
