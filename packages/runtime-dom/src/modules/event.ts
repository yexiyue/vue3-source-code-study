function createInvoker(callback){

  //妙啊直接添加函数属性保存用户传的回调函数
  const invoker:any=(e)=>invoker.value(e)
  //每次更新就不用再移除监听再重新添加监听了，直接修改value值
  invoker.value=callback
  
  return invoker//相当于闭包
}

export function patchEvent(el,eventName:string,nextValue){
  //先移除再绑定比较耗费性能
  //且看vue3的优化
  let invokers=el._vel||(el.vel={})//缓存到了dom上
  //相当于缓存
  let exist=invokers[eventName]
  if(exist && nextValue){
    //直接修改，没有卸载监听,nextValue不能为空
    //换绑操作因为invoker是一个函数里面调用的invoker.value(e)，可以看成是闭包，我们直接修改value值
    //就能完成换绑操作
    exist.value=nextValue
  }else{
    //onClick==>click
    let event=eventName.slice(2).toLowerCase()
    if(nextValue){
      //没有绑定过，直接监听,顺便缓存一下
      const invoker=invokers[eventName]=createInvoker(nextValue)
      el.addEventListener(event,invoker)
    }else if(exist){
      //如果有旧值直接移除
      el.removeEventListener(event,exist)
      //清理缓存
      invokers[eventName]=undefined
    }
  }
}