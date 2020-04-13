const { Context } = require('../context')
const ObjectId = require('mongodb').ObjectId
const _ = require('lodash')
const { unrepeatByArray } = require('../tms/utilities')

module.exports = async function(data, transform) {
    let { columns, db:dbName, cl:clName, insert } = transform.config
    if ( !columns || !dbName || !clName ) {
        return Promise.resolve([])
    }

    // 去除重复数据
    let docs = unrepeatByArray(data, columns)

    const client = await Context.mongoClient()
    let cl = client.db(dbName).collection(clName)
    let docs2 = await docs.map( async doc => {
        let find = {}
        columns.forEach( v => {
            find[v] = doc[v]
        })

        let num = await cl.find(find).count()
        if (num > 0) {
            return false
        } else {
            // 插入到去重表中
            if (insert) {
                let newDoc = JSON.parse(JSON.stringify(doc))
                delete newDoc._id
                let rst2 = await cl.insertOne(newDoc).then( rst => doc).catch( err => false )
                return rst2
            } else {
                return doc
            }
        }
    })

    return Promise.all(docs2).then( docs3 => {
        return _.filter(docs3, d => {
            if (d == false) {
                return false
            } else {
                return true
            }
        })
    })
}