export const nodeOps={
  //增删改查
  insert(child:Node,parent:Node,anchor:Node=null){
    parent.insertBefore(child,anchor)
  },
  remove(child:Node){//删除节点
    const parentNode=child.parentNode;
    if(parentNode){
      parentNode.removeChild(child)
    }
  },
  //文本节点，元素中的内容
  setElementText(el:Node,text){
    el.textContent=text
  },
  setText(node:Node,text){//document.createTextNode()
    node.nodeValue=text
  },
  querySelector(selector:string){
    return document.querySelector(selector)
  },
  //查找父节点
  parentNode(node:Node){
    return node.parentElement
  },
  //查找同胞
  nextSibling(node:Node){
    return node.nextSibling
  },
  //创建
  createElement(tagName:keyof HTMLElementTagNameMap){
    return document.createElement(tagName)
  },
  createText(text:string){
    return document.createTextNode(text)
  }
}