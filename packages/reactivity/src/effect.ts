export let activeEffect:ReactiveEffect=undefined;

//清理依赖函数
function clearupEffect(effect:ReactiveEffect){
  /**
   * 为啥不直接设置deps=[]，因为deps里面set是引用关系，引用的targetMap的，单单设置为空数组，
   * 只是让effect记录属性清空，而属性映射effect依然还存在，
   * 所以要借助deps的映射关系拿到set，再清理targetMap的映射关系
  */

  const {deps}=effect
  for(let i=0;i<deps.length;i++){
    deps[i].delete(effect);//解除effect,重新收集依赖
  }
  effect.deps.length=0
}

//解决fn里面嵌套effect activeEffect找不到问题用树形结构，以前用栈
export class ReactiveEffect {
  public active:boolean=true;//默认是激活状态
  public parent:ReactiveEffect=null;//树形父节点
  public deps:Set<ReactiveEffect>[]=[];//记录被那些属性收集过
  constructor(public fn:()=>void,public scheduler?:()=>void){}
  run(){ //run就是执行effect
    if(!this.active){
      return this.fn();//如果是非激活状态则执行函数，不需要进行依赖收集
    }
    //这里就要依赖收集了 核心就是将当前的effect和稍后渲染的属性关联在一起
    try{
      this.parent=activeEffect; //进来先保存父节点
      activeEffect=this

      //这里我们需要在执行用户函数之前清理依赖
      clearupEffect(this)
      this.fn();//当稍后调用取值操作的时候，就可以获取到这个全局变量的activeEffect
    }finally{
      //给他还回去
      activeEffect=this.parent
      this.parent=null;
    }
  }
  stop(){
    if(this.active){
      this.active=false
      clearupEffect(this);//停止依赖收集
    }
  }
}
type Runner={
  ():void
  effect:ReactiveEffect
}
type EffectOptions={
  scheduler:()=>void
}
//目标是让fn的依赖更新后fn重新执行
export function effect(fn:()=>void,options?:EffectOptions){
  //这里的fn可以根据状态变化重新执行，effect可以嵌套着写
  const _effect=new ReactiveEffect(fn,options.scheduler); //创建响应式effect

  _effect.run();//默认先执行一次

  const runner:Runner=_effect.run.bind(_effect);//绑定this指向ReactiveEffect实例
  runner.effect=_effect; //将effect挂载到runner上
  return runner
}

//依赖收集
//一个effect对应多个属性，一个属性对应多个effect，多对多
type TargetMap<T extends {}= Record<PropertyKey,any>>=WeakMap<T,Map<keyof T,Set<ReactiveEffect>>>

const targetMap:TargetMap=new WeakMap()
/**
 * targetMap数据格式
 * targetMap=<Map>{
 *    target:<Map>{
 *       key:<Set>[],
 *       name:<Set>[],
 *       age:<Set>[activeEffect]
 *    }
 * }
 */
export function track<T extends Record<PropertyKey, any>>(target:T,type:'get'|'set',key:keyof T){
  if(!activeEffect)return;//只有在effect执行时才收集依赖
  let depsMap=targetMap.get(target)
  if(!depsMap){
    targetMap.set(target,(depsMap=new Map()))
  }
  let dep=depsMap.get(key)
  if(!dep){
    depsMap.set(key,(dep=new Set()))
  }
  //有就不用收集了,性能优化，明知道不用放进去何必让他自己去重
  let shouldTrack=!dep.has(activeEffect);
  if(shouldTrack){
    dep.add(activeEffect);
    // dep就是属性对应的set里面保存的effect到时候清理直接删除set里的effect就完事
    activeEffect.deps.push(dep);//让effect记录dep属性就是上面的(name) <Set>[],稍后清理会用到
  }
}
/**
 * 单向指的是属性记录了effect,单向记录，应该让effect也
 * 记录他被哪些属性收集过，这样可以方便清理依赖
 */


export function trigger<T extends Record<PropertyKey,any>>(target:T,type:'get'|'set',key:keyof T,value:T[typeof key],oldValue:T[typeof key]){
  const depsMap=targetMap.get(target)
  if(!depsMap)return;//触发的值不在模板中使用

  let effects=depsMap.get(key)

  //永远在执行之前 先拷贝一份，不要关联引用
  if(effects){
    effects=new Set(effects)
    effects.forEach(effect=>{
      //只有不是当前全局的effect才调用
      if(effect!==activeEffect){
        if(effect.scheduler){ //判断有就执行scheduler其他什么都不干
          effect.scheduler() // 传入就用scheduler
        }else{
          effect.run() //否则默认刷新
        }
      }
    })
  }
}