const _ = require('lodash')
const { Ctrl, ResultData, ResultFault } = require('tms-koa')
const { Context } = require('../../context')
const ObjectId = require('mongodb').ObjectId

class Schema extends Ctrl {
  /**
   * 完成信息列表
   */
  async list() {
    const client = await Context.mongoClient()
    return client
      .db('tms_admin')
      .collection('mongodb_object')
      .find({ type: 'schema' })
      .toArray()
      .then(schemas => new ResultData(schemas))
  }
  /**
   * 简单信息列表
   */
  async listSimple() {
    const client = await Context.mongoClient()
    return client
      .db('tms_admin')
      .collection('mongodb_object')
      .find(
        { type: 'schema' },
        { projection: { _id: 1, title: 1, description: 1 } }
      )
      .toArray()
      .then(schemas => new ResultData(schemas))
  }
  /**
   *
   */
  async create() {
    let info = this.request.body
    info.type = 'schema'
    const client = await Context.mongoClient()
    return client
      .db('tms_admin')
      .collection('mongodb_object')
      .insertOne(info)
      .then(result => new ResultData(result.ops[0]))
  }
  /**
   *
   */
  async update() {
    const { id } = this.request.query
    let info = this.request.body
    info = _.omit(info, ['_id', 'name'])
    const client = await Context.mongoClient()
    return client
      .db('tms_admin')
      .collection('mongodb_object')
      .updateOne(
        { _id: new ObjectId(id), type: 'schema' },
        { $set: info },
        { upsert: true }
      )
      .then(() => new ResultData(info))
  }
  /**
   *
   */
  async remove() {
    const { id } = this.request.query
    if (!id) return new ResultFault("参数不完整")

    const client = this.mongoClient
    const cl = client.db('tms_admin').collection('mongodb_object')
    
    // 是否正在使用
    let rst = await cl.findOne({schema_id: id, type: "collection"})
    if (rst) {
      return new ResultFault("集合列正在被使用不能删除")
    }

    return cl
      .deleteOne({ _id: new ObjectId(id), type: 'schema' })
      .then(() => new ResultData('ok'))
  }
}
module.exports = Schema
