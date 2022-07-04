import { ReactiveEffect } from './effect'
import { isFunction } from '@vue/shared'

class ComputedRefImpl {
  constructor(public getter: () => any, public setter: (val) => void) {
    /**
     * 我们将用户的getter放到effect中，这里面的依赖会被这个effect收集
     */
    new ReactiveEffect(getter, () => {})
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
