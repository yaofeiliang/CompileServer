const { spawn } = require('child_process');

class Spawn{
  constructor(type,path,version){
    let that= this;
    that.type=type;
    that.path=path;
    that.version=version;
   return new Promise(function(resolve, reject){
    
    if(that.type=='java'){
      that.spawn('javac',resolve, reject)
    }else{
      that.spawn('go',resolve, reject)
    }
      
   })
   
    

  }
  
  spawn(command,resolve, reject){
    let that = this;
    let ls ;
    
    if(command=='javac'){
      ls = spawn(command,[that.path,'--release',that.version]);
    }else if(command=='go'){
      //需要调用docker 服务容器go版本
      ls = spawn(command,['build',that.path]);
    }
   
      ls.stdout.on('data', (data) => {
      　　console.log('正常的输出:');
      　　console.log(data.toString());
      　　console.log('~~~~~~~~~~~~~~~~~~~~');
      });

      ls.stderr.on('data', (data) => {
      　　console.log('错误输出:');
      　　console.log(data.toString());
      　　console.log('--------------------');
          reject({ok:false,err:data});
          return;
      });

      ls.on('close', (code) => {
        console.log(`子进程退出: ${code}`);
        resolve({ok:true});
      });
  }

}

module.exports=Spawn;