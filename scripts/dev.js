const { build } = require('esbuild');
const minimist =require('minimist')
const {resolve}=require('path')

const args=minimist(process.argv.slice(2))
const target=args._[0] || 'reactivity';
const format=args.f || 'global';

//开发环境只打包一个
const pkg=require(resolve(__dirname,`../packages/${target}`,'package.json'));
console.log(pkg)

//iife立即执行函数
const outputFormat=format.startsWith('global')?'iife':format==='cjs'?'cjs':'esm'

const outfile=resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`)

build({
  entryPoints:[resolve(__dirname,`../packages/${target}/src/index.ts`,)],
  outfile,
  bundle:true,//把所有的包打包到一起
  sourcemap:true,
  format:outputFormat,//输出的格式
  globalName:pkg.buildOptions?.name,//打包的全局名字
  platform:format==='cjs'?'node':'browser',//平台
  watch:{
    onRebuild(error){
      if(!error)console.log('rebuild~~~~~')
    }
  }
}).then(()=>{
  console.log('watching~~~')
})