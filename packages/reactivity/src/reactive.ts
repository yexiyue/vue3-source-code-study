import { isObject } from '@vue/shared'
import { mutableHandlers, ReactiveFlags } from './baseHandler'
// 1）将数据转换成响应式数据,只能做对象代理
// 2) 假如用户多次代理同一个对象，我们可以使用weakmap做一个映射，其键只能是对象，引用数据类型
const reactiveMap = new WeakMap()
/**
 * 1）实现一个对象代理多次，返回同一个代理
 * 2）代理对象再次被代理，可以直接返回
 */
export function reactive(target: Record<PropertyKey, any>) {
  
  if (!isObject(target)) {
    return
  }
  //如果进来的对象是代理过的proxy则直接返回
  if (Reflect.get(target, ReactiveFlags.IS_REACTIVE)) {
    //第一次没有经过代理，所以访问标识的时候访问不到
    //为啥不直接给原对象添加标识，不合理，这样用户可见，不透明了
    return target
  }
  //如果目标对象被代理过了，则返回代理对象，不用再新建了
  let existingProxy = reactiveMap.get(target)
  if (existingProxy) return existingProxy
  //第一次普通对象代理，我们通过proxy 代理一次
  //并没有重新定义属性，只是代理
  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}
