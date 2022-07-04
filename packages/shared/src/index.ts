export const isObject=(obj:unknown):boolean=>{
  return typeof obj==='object' && obj!==null
}

export const isFunction=(value:unknown)=>{
  return typeof value=='function'
}

export const isString=(value:unknown)=>{
  return typeof value=='string'
}

export const isNumber=(value:unknown)=>{
  return typeof value=='number'
}

export const isArray=Array.isArray;

export const assign=Object.assign;