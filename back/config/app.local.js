module.exports = {
  name: 'dev-op',
  router: {
    auth: {
      prefix: '/mgdb/auth' // 接口调用url的前缀
    },
    controllers: {
      prefix: '/mgdb/api' // 接口调用url的前缀，例如：/api
    },
    api: {
      prefix: '/mgdb/webApi' // 接口调用url的前缀
    },
    plugins: {
      prefix: '/mgdb/plugin' // 接口调用url的前缀
    }
  },
  tmsTransaction: false,
  auth: {
    redis: {
      prefix: process.env.TMS_REDIS_PREFIX,
      host: process.env.TMS_REDIS_HOST,
      port: parseInt(process.env.TMS_REDIS_PORT),
      expiresIn: parseInt(process.env.TMS_REDIS_EXPIRESIN) || 7200
    }
  }
}
