import { ReactiveEffect, trackEffect, triggerEffect } from './effect'
import { isFunction } from '@vue/shared'

class ComputedRefImpl {
  public effect:ReactiveEffect;
  public _dirty=true;
  public _v_isReadonly=true;
  public _v_isRef=true;
  public _value:any;
  public dep:Set<ReactiveEffect>=new Set();//记录父级effect
  constructor(public getter: () => any, public setter: (val) => void) {
    /**
     * 我们将用户的getter放到effect中，这里面的依赖会被这个effect收集
     */
    this.effect=new ReactiveEffect(getter, () => {//调度器
      //稍后数据变化后执行调度器
      /**
       * 计算属性是根据effect实现的
       * 当computed计算属性依赖的值发送变化，就执行自定义调度器
       */
      if(!this._dirty){
        this._dirty=true
        //实现一个触发更新
        triggerEffect(this.dep)
      }
    })
  }
  get value(){
    //依赖收集 当有effect调用计算属性的value值时当前全局activeEffect是父级effect，然后记录父级依赖
    trackEffect(this.dep)
    if(this._dirty){ //如果数据是脏的就重新执行一下
      this._dirty=false //相当于缓存
      this._value=this.effect.run()
    }

    return this._value
  }
  set value(newValue){
    this.setter(newValue)
  }
}

type Getter = {
  (): any
}
type Options = {
  get: () => any
  set?: (val) => void
}
interface Computed {
  (getter: Getter): void
  (options: Options): void
}
//函数重载
export const computed: Computed = (getterOrOptions: Getter | Options) => {
  let onlyGetter = isFunction(getterOrOptions)
  let getter: () => any
  let setter: (val: any) => void
  if (onlyGetter) {
    getter = getterOrOptions as Getter
    setter = () => {
      console.warn('no set')
    }
  } else {
    getter = (getterOrOptions as Options).get
    setter = (getterOrOptions as Options).set
  }

  return new ComputedRefImpl(getter, setter)
}
