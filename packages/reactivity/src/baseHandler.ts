import { isObject } from "@vue/shared"
import { reactive } from "./reactive"
import {track,trigger} from "./effect"
export const enum ReactiveFlags {
  IS_REACTIVE='__v_isReactive'
}
export const mutableHandlers={
    
  get(target,prop,receiver){
   /**
    * 设置代理标识，这样只有访问的时候才可见，
    * 用户并不知道该属性，实际上原对象并没有该属性
    * 只是访问的时候刚好命中get
    */
    if(prop==ReactiveFlags.IS_REACTIVE){
      return true
    }
    track(target,'get',prop)
    //取值操作
    let res=Reflect.get(target,prop,receiver)

    if(isObject(res)){
      return reactive(res);//深度代理，性能也好，只有当取值的时候才做代理，不取就不代理
    }

    return res
  },
  set(target,prop,value,receiver){
    //先比对一下是否要更新
    let oldValue=target[prop]
    let result=Reflect.set(target,prop,value,receiver)
    //比对不一样才去触发更新，触发effect
    if(oldValue!=value){
      trigger(target,'set',prop,value,oldValue)
    }
    return result
  }
}