const ObjectId = require('mongodb').ObjectId
const _ = require('lodash')
const log4js = require('log4js')
const logger = log4js.getLogger('mongodb-web-ylyTuiDing')
const request = require('request')
const MODELCOLL = require('../models/mgdb/collection')

// 同步接口地址
const { httpApiUrl } = require("../config/plugins")
const HTTP_SYNCTEL_URL = httpApiUrl.syncMobilePool.syncTle
const myURL = new URL(HTTP_SYNCTEL_URL)

module.exports = async function (datas, notRemoveDatas, transform) {
  // 获取表的拓展属性
  let dbObj = await MODELCOLL.getCollection(transform.db, transform.cl)
  if (!dbObj.extensionInfo) {
    notRemoveDatas = "ALL"
    logger.warn("未找到文件的拓展属性")
    return notRemoveDatas
  }
  if (typeof dbObj.extensionInfo.info.pro_type1 === "undefined") {
    notRemoveDatas = "ALL"
    logger.warn("不是云录音客户表")
    return notRemoveDatas
  }

  let http = datas.map(async tel => {
    // 检查文档中的必要字段
    if (!tel.tel) {
      let tdStatus = "退订失败：号码为空"
      //   await colle.updateOne({ _id: ObjectId(tel._id) }, { $set: { sync_status: tdStatus } })
      logger.warn(tel.tel + " : " + tdStatus)
      return Promise.resolve({ status: false, msg: tdStatus, tel })
    }
    if (!tel.sync_time || !tel.sync_status) {
      let tdStatus = "退订失败：没有同步时间或没有同步状态"
      logger.warn(tel.tel + " : " + tdStatus)
      return Promise.resolve({ status: false, msg: tdStatus, tel })
    }
    // 处理同步数据
    let ctlInsData = {
      operation: "2",
      tel: tel.tel,
      status: "99", // 退订
      proType: "1"
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
          return resolve({ status: false, msg: tdStatus, tel })
        }
        if (!body) {
          let tdStatus = "body为空; "
          logger.warn(tel.tel + " : " + tdStatus)
          return resolve({ status: false, msg: tdStatus, tel })
        } else if (typeof body === 'string') {
          try {
            body = JSON.parse(body)
          } catch (error) {
            let tdStatus = "返回解析失败：" + body
            logger.warn(tel.tel + " : " + tdStatus)
            return resolve({ status: false, msg: tdStatus, tel })
          }
        }
        if (body.returnCode != "0") {
          let tdStatus = body.msg
          logger.warn(tel.tel + " : " + tdStatus)
          return resolve({ status: false, msg: tdStatus, tel })
        }
        return resolve({ status: true, msg: "成功" })
      })
    })
  })

  return Promise.all(http).then(rst => {
    notRemoveDatas = []
    rst.forEach(r => {
      if (r.status === false)  notRemoveDatas.push(r.tel)
    })

    return notRemoveDatas
  })
}