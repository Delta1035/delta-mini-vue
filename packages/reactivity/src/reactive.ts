import { isObject } from "@vue/shared";
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers);
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReadonly(target) {
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
export function createReactiveObject(target, isReadonly, baseHandlers) {
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
