/**
 * 检查是否是对象
 *
 * @param {string} prop 数据项路径
 * @param {*} val 数据
 * @return {boolean} 返回bool值
 */
export function isObject(val) {
    return val != null && typeof val === 'object';
}

/**
 * class的mixin
 *
 * @param {string} target 子类
 * @param {*} source 继承类
 */
export function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        // name,constructor,prototype之外属性就是实例属性
        if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            // 返回某个对象属性的描述对象（ descriptor ）。 参数(对象, 属性)
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}
