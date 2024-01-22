// 实现代理处理
// 是不是只读，只读的set需要报异常
// 是不是深度得
/**
 * 后续object上面的方法会被迁移到reflect Reflect.getProptypeof()
 * Reflect方法有返回值，可以知道操作是否成功,失败需要报异常
 * Reflect可以不使用proxy es6的语法
 */
import {
  extend,
  hasChanged,
  hasOwn,
  isArray,
  isIntegerKey,
  isObject,
} from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive, readonly } from "./reactive";
// 拦截取值功能
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    if (!isReadonly) {
      // 收集依赖，等会数据变化后更新对应的视图
      console.log("执行effect时会取值,收集effect");
      track(target, TrackOperatorTypes.GET, key);
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
    // 需要区分是新增还是修改，vue2里面无法监控索引的更改，无法监控数组的长度变化=》hack方法，特殊处理
    const oldValue = target[key];
    let hasKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    if (!hasKey) {
      // 判断是新增还是修改
      // 不存在这个key，所以是新增
      trigger(target, TriggerOperatorTypes.ADD, key, value);
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, TriggerOperatorTypes.SET, key, value, oldValue);
    }
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

export const mutableHandlers = { get, set };
export const shallowReactiveHandlers = { get: shallowGet, set: shallowSet };
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);
export const shallowReadonlyHandlers = extend(
  { get: shallowReadonlyGet },
  readonlyObj
);
