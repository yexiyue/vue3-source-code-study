import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

//dom属性的相关操作
export function patchProp(el:HTMLElement,key,preValue,nextValue){
  //1.类名 el.className
  if(key==='class'){
    patchClass(el,nextValue)
  }else if(key==='style'){//样式 el.style
    patchStyle(el,preValue,nextValue)
  }else if(/^on[A-Z]/.test(key)){//events
    patchEvent(el,key,nextValue)
  }else{//普通属性
    patchAttr(el,key,nextValue)
  }
}