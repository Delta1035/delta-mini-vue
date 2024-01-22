'use strict';

function effect(fn, options = {}) {
    // 让effect变成响应式的，当数据变化之后重新执行
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        effect();
    }
    return effect;
}
let uid = 0;
let activeEffect; // 存储当前的effect
const effectStack = [];
function createReactiveEffect(fn, options = {}) {
    const effect = function reactiveEffect() {
        if (!effectStack.includes(effect)) {
            // 确保effect没有加入到effectStack，否则重复添加会导致页面无限刷新
            try {
                effectStack.push(effect);
                activeEffect = effect;
                return fn();
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[activeEffect.length - 1];
            }
        }
    };
    effect.id = uid++; // effect标识，用于区分effect
    effect._isEffect = true; // 标识 这是一个响应式effect
    effect.raw = fn; // 保留原始的函数
    effect.options = options; // 保留配置项
    return effect;
}
const targetMap = new WeakMap();
// 让某个对象中的属性收集当前他对应的effect函数
function track(target, type, key) {
    console.log("track", target, type, key);
    if (activeEffect === undefined) {
        // 没有在effect中使用，所以这个属性不需要收集
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key); // 依赖对应的effect函数
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
    }
    console.log(targetMap);
}

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
        if (!isReadonly) {
            // 收集依赖，等会数据变化后更新对应的视图
            console.log("执行effect时会取值,收集effect");
            track(target, 0 /* TrackOperatorTypes.GET */, key);
        }
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
        // 当数据更新时 通知对应的属性的effect重新执行
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

exports.effect = effect;
exports.reactive = reactive;
exports.readonly = readonly;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
//# sourceMappingURL=reactivity.cjs.js.map
