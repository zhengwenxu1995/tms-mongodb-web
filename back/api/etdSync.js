const { Ctrl, ResultData, ResultFault } = require('tms-koa')
const { Context } = require('../context')
const modelBase = require('../models/mgdb/base')

class Select extends Ctrl {
  constructor(...args) {
    super(...args)
  }
  /**
   * 对插入到表中的数据进行加工
   */
  _beforeProcessByInAndUp(data, type) {
    let model = new modelBase()
    model._beforeProcessByInAndUp(data, type)

    return data
  }
  /**
   * etd 同步号码至号池
   */
   async syncEtdToPoll() {
    let { db:dbName, cl:clName } = this.request.query
    let { docs } = this.request.body
    if (!dbName || !clName || !docs || docs.length === 0) return new ResultFault("参数不完整")

    let newDocs = docs.map(doc => {
      this._beforeProcessByInAndUp(doc, 'insert')
      return doc
    })

    const client = await Context.mongoClient()
    // 将数据插入到指定表中
    const cl = client.db(dbName).collection(clName)
    return cl
      .insertMany(newDocs)
      .then(rst => new ResultData(rst.length))
      .catch(err => new ResultFault(err.toString()))
   }
}

module.exports = Select