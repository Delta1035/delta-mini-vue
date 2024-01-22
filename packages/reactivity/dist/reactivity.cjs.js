'use strict';

const isObject = (value) => typeof value == "object" && value !== null;
const extend = Object.assign;

// 实现代理处理
// 是不是只读，只读的set需要报异常
// 是不是深度得
/**
 * 后续object上面的方法会被迁移到reflect Reflect.getProptypeof()
 * Reflect方法有返回值，可以知道操作是否成功,失败需要报异常
 * Reflect可以不使用proxy es6的语法
 */
// 拦截取值功能
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            // vue 2是一上来就递归，vue3是当取值是才会进行代理，是懒代理
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
// 拦截赋值功能
function createSetter(shallow = false) {
    return function get(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        return res;
    };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const readonlyObj = {
    set: (target, key) => {
        console.warn(`set on key ${key} failed`);
    },
};
const set = createSetter();
const shallowSet = createSetter(true);
const mutableHandlers = { get, set };
const shallowReactiveHandlers = { get: shallowGet, set: shallowSet };
const readonlyHandlers = extend({
    get: readonlyGet,
}, readonlyObj);
const shallowReadonlyHandlers = extend({ get: shallowReadonlyGet }, readonlyObj);

function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}
/**
 * 是不是只读
 * 是不是深度
 * 柯里化
 * new proxy() 最核心的需求是拦截，数据的读取和修改 Get Set
 *
 */
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
function createReactiveObject(target, isReadonly, baseHandlers) {
    // 如果目标不是对象，则没办法拦截，reactive只能拦截对象类型
    if (!isObject(target)) {
        return target;
    }
    // 如果某个对象已经被代理过了，就不需要再次代理，可能对象的代理是深度得，又被只读代理了
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    const existProxy = proxyMap.get(target);
    if (existProxy) {
        return existProxy; // 直接返回已经被代理过得对象
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

exports.reactive = reactive;
exports.readonly = readonly;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
//# sourceMappingURL=reactivity.cjs.js.map
