export function effect(fn, options: any = {}) {
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
function createReactiveEffect(fn, options: any = {}) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      // 确保effect没有加入到effectStack，否则重复添加会导致页面无限刷新
      try {
        effectStack.push(effect);
        activeEffect = effect;
        return fn();
      } finally {
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
export function track(target, type, key) {
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

export function trigger(target, type, key?, newValue?, oldValue?) {
  console.log("trigger :>>>>", target, type, key, newValue, oldValue);
}
