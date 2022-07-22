export function patchStyle(el:HTMLElement,preValue,nextValue){
  //样式需要比对差异
  for(let i in nextValue){//新的直接覆盖
    el.style[i]=nextValue[i]
  }
  if(preValue){
    for(let i in preValue){
      //如果旧值有新值没有直接设置为null
      if(nextValue[i]==null){
        el.style[i]=null
      }
    }
  }
}