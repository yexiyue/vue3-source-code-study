import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import {createRenderer} from '@vue/runtime-core'
export const renderOptions=Object.assign(nodeOps,{patchProp})

//createRenderer(renderOptions).render(h('h1','hello'),document.getElementById('app'))
//console.log(renderOptions)

//语法糖，渲染虚拟DOM。虚拟DOM，和渲染都与平台无关
export function render(vnode,container){
  //在创建渲染器的时候传入选项
  createRenderer(renderOptions).render(vnode,container)
}

//暴露runtime-core模块的方法
export * from '@vue/runtime-core'

/**
 * runtime-dom本质上啥也没做，只不过封装了一些平台相关的代码
 */