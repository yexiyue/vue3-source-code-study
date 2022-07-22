export function patchClass(el:HTMLElement,nextValue){
  if(nextValue==null){
    el.removeAttribute('class')//不需要class直接移除
  }else{
    //直接覆盖
    el.className=nextValue
  }
}