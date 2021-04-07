const path = require('path');//引入原生path模块
const log4js = require('koa-log4');//引入koa-log4

log4js.configure({
  appenders: {
    //访问日志
    access: {
      type: 'dateFile',
      // maxLogSize: 10000000, // 文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件xxx.log.1的序列自增长的文件
      //compress: true, //（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
      pattern: '-yyyy-MM-dd.log', //通过日期来生成文件
      alwaysIncludePattern: true, //文件名始终以日期区分
      encoding:"utf-8",
      filename: path.join(__dirname,'logs/', 'access.log') //生成文件路径和文件名
    },
    //系统日志
    application: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //通过日期来生成文件
      alwaysIncludePattern: true, //文件名始终以日期区分
      encoding:"utf-8",
      filename: path.join(__dirname,'logs/', 'application.log') //生成文件路径和文件名
    },
    out: {
      type: 'console'
    }
  },
  categories: {
    default: { appenders: [ 'out' ], level: 'info' },
    access: { appenders: [ 'access' ], level: 'info' },
    application: { appenders: [ 'application' ], level: 'WARN'}
  }
});

exports.accessLogger = () => log4js.koaLogger(log4js.getLogger('access')); //记录所有访问级别的日志
exports.systemLogger = log4js.getLogger('application');  //记录所有应用级别的日志