import { isObject, isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';
import {isReactive} from './reactive'

//循环遍历source
function traversal(value,set=new Set()){//考虑循环引用问题
    if(!isObject(value))return value

    if(set.has(value)){//处理循环引用
      return value
    }

    set.add(value)

    for(let key in value){
      //这里只是遍历进行依赖收集，并不需要接收返回值
      traversal(value[key],set)
    }
    return value
}

//watch也是基于effect实现
/**
 * @param source 用户传入的对象
 * @param cb 用户传入的回调
 */
export function watch(source,cb){
  let getter;
  if(isReactive(source)){
    getter=()=>traversal(source)
  }else if(isFunction(source)){//是函数就直接传给ReactiveEffect
    getter=source
  }else{
    return
  }
  let cleanUp:()=>void
  //清除副作用函数
  const onInvalidate=(fn:()=>void)=>{
    cleanUp=fn;//保存用户的函数
  }

  let oldValue;
  const job=()=>{
    //job是调度器，当依赖触发更新时，我再调一次run相当于再次执行getter获得新值
    if(cleanUp)cleanUp()//下一次watch开始触发用户定义的清理函数
    const newValue=effect.run()
    cb(newValue,oldValue,onInvalidate)
    oldValue=newValue
  }
  const effect=new ReactiveEffect(getter,job)
  //执行一次run相当于执行一次getter，收集依赖，同时返回值就是老值
  oldValue=effect.run()
}