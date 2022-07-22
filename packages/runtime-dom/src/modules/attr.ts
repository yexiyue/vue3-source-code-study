export function patchAttr(el:HTMLElement,key,nextValue){
  if(nextValue){
    el.setAttribute(key,nextValue)
  }else{
    el.removeAttribute(key)
  }
}