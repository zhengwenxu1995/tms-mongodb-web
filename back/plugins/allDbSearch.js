const { ResultData, ResultFault } = require('tms-koa')
const Base = require('./base')
const _ = require("lodash")
const params = require("../config/plugins").db

class AllDbSearch extends Base {
    constructor(...args){
        super(...args)
    }
    // tms_admin 
    // tms_app_data_action_log
    async searchpHandle (){
        let {  page = null, size = null, tel = null ,clumn} = this.request.query
        let dbObj = this.mongoClient
        let colle = dbObj.db("tms_admin").collection('tms_app_data_action_log')
        let findTerm = {} 
        if(!page) page = 1
        if(!size ) size = 10 
        if(tel) findTerm[params.submits[0].config.clumn] = new RegExp(`^${tel}`)
        let total = await colle.find(findTerm).count()
        let datalist = await colle.find(findTerm).skip(parseInt((page - 1) * size )).limit(parseInt(size)).toArray()
        return new ResultData({
            total,
            datalist
        })
    }
}


module.exports = AllDbSearch;