> #### 在fastapi内使用
fastapi框架已经内置该插件，所以只要写好配置就可以了。
```javascript
// src/conifg/index.default.js
module.exports = {
  // ...
  databases: {
    zeus: { // 数据库名，也是最终挂载后的属性名
      alias: 'zeus_production', // 为了解决daily和production库名不一致的问题
      username: 'dev1',
      password: 'dev99999',
      dialect: 'mysql',
      host: 'rm-xxxxxxxxxxxxxx.mysql.rds.aliyuncs.com',
      port: 3306,
      define: {
        underscored: true,
        timestamps: false
      }
    }
  }
}
```
注意: 如果用的是mysql,还需要安装mysql2这个包作为驱动。同理，用其它数据库也要安装对应驱动。
正确配置后就可以在api和servcie内通过this.db.[数据库名].[model名]获取到model实例。比如：
```javascript
this.db.zeus.model.union_bind_relation.findAll({
      raw: true,
      where: {
        accountId
      }
    })
```