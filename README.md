# 编译服务器

## 程序目录结构

- app ——程序
  - logs——日志
  - 
    - access.log——用户日志
    - application.log——系统日志
  - node_module——引用模块
  - public——静态文件
    - uploads ——上传文件
      - go
        - uuid
          - 源文件
          - 编译的文件
      - java
- HellWorld ——测试的java、go 源文件 



## 运行项目

~~~
cd app			//进入程序目录
npm install //安装依赖
npm start		//启动程序
~~~



## web service

#### node.js 构建路由

##### app.js 核心服务逻辑

~~~~
const Koa = require('koa');
//使用koa 异步处理强服务框架
//编译管理文件上传、日志等中间件
~~~~



##### 上传文件并指定版本

~~~json
http --ignore-stdin --form --follow --timeout 3600 POST 'http://localhost:3000/upload' \
 'file'@/Users/yao/composetest/HelloWorld/go/HelloWorld.go \
 'version'='1.11'
 //需要字段 file上传文件以及version版本字段
 //可用postman测试或直接通过 ui前段 测试 http://localhost:3000/
 //版本号范围
 //const version_go = ['1.11','1.12','1.13']
 //const version_java = ['8','9','10']
 
 //返回参数
 {
    "file_name": "HelloWorld.go",//源文件名
    "file_url": "http://localhost:3000/uploads/go/bc317a6a-0da0-4448-a551-0571f546aa91/HelloWorld.go",//源码文件地址
    "build_url": "http://localhost:3000/uploads/go/bc317a6a-0da0-4448-a551-0571f546aa91/HelloWorld"//编译后的文件地址
}
~~~



##### 启用子进程执行编译逻辑 my_child_pocess

~~~~
spawn(command,[that.path,'--release',that.version]);
//java编译 javac HelloWorld.java --release 8 
//go编译 go build HelloWorld.go
~~~~







