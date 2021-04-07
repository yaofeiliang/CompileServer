const Koa = require('koa');
const app = new Koa()
, koaBody = require('koa-body')
, logger = require('koa-logger')
, json = require('koa-json')

, render = require('koa-art-template')
, path = require('path')
, router = require('koa-router')()
, { execSync } = require('child_process')
, { v4 } = require('uuid')
, fs = require('fs')
, {accessLogger,systemLogger} = require('./log')
,  Spawn = require('./my_child_pocess');

app.use(accessLogger()); //中间件




//配置koa-art-template模板引擎
render(app,{
  root:path.join(__dirname,'views'), //视图的位置
  extname:'.html', //后缀名
  debug: process.env.NODE_ENV !== 'production' //是否开启调试模式
})

app.use(koaBody({
  // 支持文件格式
  multipart: true,
  formidable: {
      // 上传目录
      uploadDir: path.join(__dirname, 'public/uploads'),
      // 保留文件扩展名
      keepExtensions: true,
      maxFieldsSize:2 * 1024 * 1024,
      onFileBegin:(name,file) => {
         console.log(name);
         let getUploadDirName=()=>{
           // 获取文件后缀
           const _file_name_arr=file.name.split(`.`);
            if(_file_name_arr[_file_name_arr.length-1]==`go`){
              return `go/${v4()}`
            }else if(_file_name_arr[_file_name_arr.length-1]==`java`){
              return `java/${v4()}`
            }else{
              //不是需要哥格式文件，添加到程序日志
              systemLogger.error(`上传文件`,`类型不正确:${file.name}`)
              return;
            }
         }
         
        // 最终要保存到的文件夹目录
        const dir = path.join(__dirname,`public/uploads/${getUploadDirName()}`);
        // 检查文件夹是否存在如果不存在则新建文件夹
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        // 重新覆盖 file.path 属性
        file.path = `${dir}/${file.name}`;
      },
      onError:(err)=>{
        systemLogger.error(`上传文件`,err)
        console.log(err);
      }
    }
}));

app.use(require('koa-bodyparser')());
app.use(json());
app.use(logger());

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(require('koa-static')(__dirname + '/public'));



router.get('/', async function (ctx,next) {
  await ctx.render('index', {
    title: 'Hello World !'
  });
});

router.post('/upload',async (ctx) => {
  
  console.log(ctx.request.body)
  const file = ctx.request.files.file
  const version = ctx.request.body.version


    if(!file||!version){
      ctx.body = 'client error response'
      return;
    }
    const _file_name_arr=file.name.split(`.`);
    if(_file_name_arr[_file_name_arr.length-1]==`go`){
      const version_go = ['1.11','1.12','1.13']
     
      if(version_go.includes(version)){
         let  data = await new Spawn(`go`,file.path,version).catch(err => {
          ctx.body = 'server error response'
          return;
        });
         
        if(!data.ok){
          systemLogger.error(data.err)
          ctx.body = 'server error response'
          return;
        }else{
          const basename = file.path.split(`/uploads/`)[1];
          ctx.body = { 
            "file_name":file.name,
            "file_url": `${ctx.origin}/uploads/${basename}` ,
            "build_url": `${ctx.origin}/uploads/${basename.replace(".go","")}` 
          }
          return;
        }
      }else{
        ctx.body = 'client error response'
        return;
      }
    
    }else if(_file_name_arr[_file_name_arr.length-1]==`java`){
      const version_java = ['8','9','10']
      if(version_java.includes(version)){
        let  data = await new Spawn(`java`,file.path,version)
       
        if(!data.ok){
          systemLogger.error(data.err)
          ctx.body = 'server error response'
          return;
        }else{
          const basename = file.path.split(`/uploads/`)[1];
  
          ctx.body = { 
            "file_name":file.name,
            "file_url": `${ctx.origin}/uploads/${basename}` ,
            "build_url": `${ctx.origin}/uploads/${basename.replace(".java",".class")}` 
          }
          return;
        }
      }else{
        ctx.body = 'client error response'
        return;
      }
    }else{
      ctx.body = 'client error response'
      return;
    }

  
  
  
})

app.use(router.routes(), router.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  systemLogger.error(err)//系统日志--记录系统状态的error logger.error(err)
  console.error('server error', err, ctx)
  ctx.body = 'server error response'
});

app.listen(3000);