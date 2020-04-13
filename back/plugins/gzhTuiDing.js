const _ = require('lodash')
const log4js = require('log4js')
const logger = log4js.getLogger('mongodb-web-gzhTuiDing')
const request = require('request')
const MODELCOLL = require('../models/mgdb/collection')

// 同步接口地址
const { httpApiUrl } = require("../config/plugins")
const HTTP_SYNCTEL_URL = httpApiUrl.syncMobilePool.syncTle
const myURL = new URL(HTTP_SYNCTEL_URL)

module.exports = async function (datas, transform) {
  // 获取表的拓展属性
  let dbObj = await MODELCOLL.getCollection(transform.oldDb, transform.oldCl)
  if (!dbObj.extensionInfo) {
    logger.warn("未找到文件的拓展属性")
    return []
  }
  if (typeof dbObj.extensionInfo.info.pro_type3 === "undefined") {
    logger.warn("不是工作号客户表")
    return []
  }

  let data2 = datas.map(async tel => {
    // 检查文档中的必要字段
    if (!tel.tel) {
      let tdStatus = "退订失败：号码为空"
      logger.warn(tel.tel + " : " + tdStatus)
      return Promise.resolve(false)
    }
    if (!tel.sync_time || !tel.sync_status) {
      let tdStatus = "退订失败：没有同步时间或没有同步状态"
      logger.warn(tel.tel + " : " + tdStatus)
      return Promise.resolve(false)
    }
    // 处理同步数据
    let ctlInsData = {
      operation: "2",
      tel: tel.tel,
      status: "99", // 退订
      proType: "3"
    }
    // 开始同步
    return new Promise(async (resolve) => {
      request({
        url: HTTP_SYNCTEL_URL,
        method: "POST",
        json: true,
        headers: {
          "Content-Type": "application/json",
          "Host": myURL.host
        },
        body: ctlInsData
      }, async function (error, response, body) {
        logger.debug(HTTP_SYNCTEL_URL, response.request.headers, response.request.body)
        if (error) {
          logger.error("yly-tuiding", error)
          let tdStatus = "接口发送失败; "
          logger.warn(tel.tel + " : " + tdStatus)
          return resolve(false)
        }
        if (!body) {
          let tdStatus = "body为空; "
          logger.warn(tel.tel + " : " + tdStatus)
          return resolve(false)
        } else if (typeof body === 'string') {
          try {
            body = JSON.parse(body)
          } catch (error) {
            let tdStatus = "返回解析失败：" + body
            logger.warn(tel.tel + " : " + tdStatus)
            return resolve(false)
          }
        }
        if (body.returnCode != "0") {
          let tdStatus = body.msg
          logger.warn(tel.tel + " : " + tdStatus)
          return resolve(false)
        }
        return resolve(tel)
      })
    })
  })

  return Promise.all(data2).then(rst => {
    return _.filter(rst, d => {
      if (d == false) {
        return false
      } else {
        return true
      }
    })
  })
}