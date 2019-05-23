const fp = require("fastify-plugin");
const Sequelize = require("sequelize");
const globby = require("globby");

module.exports = fp(async (fastify, options = {}, next) => {
  const { path: modelDirectoryRoot, databases } = options;
  if (modelDirectoryRoot && databases) {
    let db = {};
    if (!modelDirectoryRoot) {
      throw new Error("需要传path参数以指明databases的目录");
    }
    const dbs = Object.keys(databases);
    await Promise.all(
      dbs.map(async dbNmae => {
        const { username, password, alias, ...otherConfig } = databases[dbNmae];
        const sequelizeInstance = new Sequelize(
          alias || dbNmae,
          username,
          password,
          otherConfig
        );
        fastify.addHook("onClose", (_, done) => {
          sequelizeInstance
            .close()
            .then(done)
            .catch(done);
        });
        const modelDirectory = modelDirectoryRoot + "/" + dbNmae;
        const modelPaths = await globby(modelDirectory);
        let models = {};
        modelPaths.forEach(path => {
          const tableName = path.replace(/.+\/(.+)\.model\.js/, "$1");
          models[tableName] = sequelizeInstance.define(
            tableName,
            require(path),
            {
              tableName
            }
          );
        });
        db[dbNmae] = {
          model: models
        };
      })
    );
    fastify.decorate("db", db);
  } else {
    console.log('sequelize插件缺少必要配置参数（path，databases）,跳过该插件')
  }
  next();
});
