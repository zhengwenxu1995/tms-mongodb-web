module.exports = {
  name: 'dev-op',
  router: {
    auth: {
      prefix: '/pool/auth' // 接口调用url的前缀
    },
    controllers: {
      prefix: '/pool/api' // 接口调用url的前缀，例如：/api
    },
    api: {
      prefix: '/pool/webApi' // 接口调用url的前缀
    },
    plugins: {
      prefix: '/pool/plugin' // 接口调用url的前缀
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
