import { isArray } from '@vue/shared';
import { isObject } from '@vue/shared';
import { triggerEffect, trackEffect, ReactiveEffect } from './effect'
import { reactive } from './reactive'

function toReactive(value: unknown) {
  return isObject(value) ? reactive(value) : value
}
//依赖收集跟计算属性一样
class RefImpl {
  public _value
  public dep: Set<ReactiveEffect> = new Set() //收集依赖的容器
  public _v_isRef = true
  constructor(public rawValue: unknown) {
    this._value = toReactive(rawValue)
  }
  get value() {
    //收集依赖
    trackEffect(this.dep)
    return this._value
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      //新值可能是对象就给它加个响应式
      this._value = toReactive(newValue)
      //保存新值
      this.rawValue = newValue
      //更新触发依赖
      triggerEffect(this.dep)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}

//做一层代理
class ObjectRefImpl{
  constructor(public object,public key){}
  get value(){
    return this.object[this.key]
  }
  set value(newValue){
    this.object[this.key]=newValue
  }
}

//把某个属性做成代理
export function toRef(object,key){
  return new ObjectRefImpl(object,key)
}

//全部代理
export function toRefs(object){
  const result =isArray(object)?new Array(object.length):{}
  for(let key in object){
    result[key]=toRef(object,key)
  }
  return result
}

//跟toRefs相反，模板里用
export function proxyRefs(object){
  return new Proxy(object,{
    get(target,key,receiver){
      //看看取的值是不是ref
      let ref:RefImpl=Reflect.get(target,key,receiver)
      //是就返回ref.value,不是就返回原值
      return ref._v_isRef?ref.value:ref
    },
    set(target,key,value,receiver){
      let oldValue:RefImpl=target[key]
      //是ref就.value赋值，不是就直接赋值就行
      if(oldValue._v_isRef){
        oldValue.value=value
        return true
      }else{
        return Reflect.set(target,key,value,receiver)
      }
      
    }
  })
}