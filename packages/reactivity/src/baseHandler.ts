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
    return Reflect.get(target,prop,receiver)
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