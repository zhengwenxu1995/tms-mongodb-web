<template>
  <tms-frame
    class="tmw-collection"
    :display="{ header: true, footer: true, right: true }"
    :leftWidth="'20%'"
  >
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ name: 'home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ name: 'database', params: { dbName: dbName } }">{{dbName}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{clName}}</el-breadcrumb-item>
      </el-breadcrumb>
    </template>
    <template v-slot:center>
      <el-table 
        :data="documents" 
        stripe 
        id="tables"
        class="table-fixed"
        style="width: 100%">
        <el-table-column
          v-for="(s, k) in collection.schema.body.properties"
          :key="k"
          :prop="k">
          <template slot="header">
            <span>{{ s.title }}</span>
            <img src="../assets/icon_filter.png" class="icon_filter" @click="handleSelect(s, k)">
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button size="mini" @click="editDocument(scope.row)">修改</el-button>
            <el-button size="mini" @click="handleDocument(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination 
        style="float: right"
        background
        @size-change="handleSize" 
        @current-change="handleCurrentPage" 
        :current-page.sync="page.at" 
        :page-sizes="[10, 25, 50, 100]" 
        :page-size="page.size" 
        layout="total, sizes, prev, pager, next"
        :total="page.total">
      </el-pagination>
    </template>
    <template v-slot:right>
      <el-button @click="createDocument">添加文档</el-button>
    </template>
  </tms-frame>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations } from 'vuex'
import { Frame } from 'tms-vue-ui'
Vue.use(Frame)

import DocEditor from '../components/DocEditor.vue'
import SelectCondition from '../components/SelectCondition.vue'
import { collection as apiCol, doc as apiDoc } from '../apis'

export default {
  name: 'Collection',
  props: ['dbName', 'clName'],
  data() {
    return {
      collection: { schema: { body: { properties: [] } } },
      page: {
				at: 1,
				size: 100,
				total: 0    
      },
      dialogPage: {
        at: 1,
				size: 10,
      }
    }
  },
  computed: {
    ...mapState(['documents', 'conditions'])
  },
  methods: {
    ...mapMutations([
      'updateDocument',
      'conditionReset'
    ]),
    handleCondition() {
      let _obj = JSON.parse(JSON.stringify(this.conditions))
      if(!_obj.length) {
        return {filter: {}, orderBy: {}}
      }
      if(_obj.length === 1){
        return {
          filter: _obj[0].rule.filter,
          orderBy: _obj[0].rule.orderBy
        }
      }
      return _obj.map(ele => ele.rule).reduce((prev, curr) => {
        return {
          filter: Object.assign(prev.filter, curr.filter),
          orderBy: Object.assign(prev.orderBy, curr.orderBy)
        }
      })
    },
    handleSelect(obj, columnName) {
      this.dialogPage.at = 1
      const select = new Vue(SelectCondition)
      if(this.conditions.length) {
        const columnobj = this.conditions.find(ele => ele.columnName === columnName)
        const rule = this.handleCondition()
        if(columnobj){
          select.condition.isCheckBtn = columnobj.isCheckBtn
          select.condition.keyword = columnobj.keyword
          select.condition.selectValue = columnobj.selectValue
          select.condition.rule = columnobj.rule
        }
        const { filter, orderBy } = rule
        apiDoc.byColumnVal(this.dbName, this.clName, columnName, filter, orderBy, this.dialogPage.at, this.dialogPage.size).then(columnResult => {
          select.condition.selectResult = columnResult
          // 暂时先用延迟解决，该方法还需改进
          setTimeout(() => {
            select.toggleSelection(columnResult)
          }, 0)
        })
      } else {
        apiDoc.byColumnVal(this.dbName, this.clName, columnName, undefined, undefined, this.dialogPage.at, this.dialogPage.size).then(columnResult => {
          select.condition.selectResult = columnResult
        })
      }
      select.open(columnName, this.dbName, this.clName, this.dialogPage).then(rsl => {
        const { condition, isClear, isCheckBtn } = rsl
        this.$store.commit('conditionAddColumn', {condition})
        if (isClear) this.$store.commit('conditionDelColumn', {condition})
        let objPro = this.collection.schema.body.properties
        if(isCheckBtn) this.$store.commit('conditionDelBtn', {columnName})
        Object.keys(objPro).map((ele, index) => {
          const attrs = document.querySelectorAll('#tables thead.has-gutter img')[index]
          if (ele === columnName) {
            if(isClear) {
              attrs.src = require('../assets/icon_filter.png')
            }else if(isCheckBtn) {
              attrs.src = require('../assets/icon_'+ condition.rule.orderBy[columnName] + '_active.png')
            }else {
              attrs.src = require('../assets/icon_filter_active.png')
            }
          } else if (isCheckBtn) {
            // 如果选择升降序规则，则需重置其他图标
            this.conditions.map(conEle => {
              if (ele === conEle.columnName) {
                if(conEle.rule && conEle.rule.filter && conEle.rule.filter[ele] && conEle.rule.filter[ele].keyword) {
                  attrs.src = require('../assets/icon_filter_active.png')
                }else if(conEle.isCheckBtn.includes(false)) {
                  attrs.src = require('../assets/icon_'+ conEle.rule.orderBy[ele] + '_active.png')
                }else {
                  attrs.src = require('../assets/icon_filter.png')
                }
              }
            })
          }
          return ele
        })
        this.listDocument()
      })
    },
    createDocument() {
      let editor = new Vue(DocEditor)
      editor.open(this.dbName, this.collection).then(() => {
        this.listDocument()
      })
    },
    editDocument(doc) {
      let editor = new Vue(DocEditor)
      editor.open(this.dbName, this.collection, doc).then(newDoc => {
        Object.assign(doc, newDoc)
        this.updateDocument({document: newDoc})
      })
    },
    handleDocument(document) {
      this.$customeConfirm('数据库', () => {
        return apiDoc.remove(this.dbName, this.clName, document._id).then(() => {
          this.listDocument()
        })
      })
    },
    listDocument() {
      const rule = this.handleCondition()
      const { orderBy, filter } = rule
      this.$store.dispatch({
        type: 'listDocument',
        db: this.dbName,
        cl: this.clName,
        page: this.page,
        orderBy,
        filter
      }).then(result => {
        this.page.total = result.total
      })
    },
    handleSize(val) {
			this.page.size = val
			this.listDocument()
		},
		handleCurrentPage(val) {
			this.page.at = val
			this.listDocument()
    }
  },
  mounted() {
    apiCol.byName(this.dbName, this.clName).then(collection => {
      this.collection = collection
      this.listDocument()
    })
  },
  beforeDestroy(){
    this.conditionReset()
  }
}
</script>
<style lang="less" scoped>
.tmw-collection {
  .icon-style {
    margin-left: 10px;
    cursor: pointer;
  }
  .icon-heightlight {
    color: #409EFF;
  }
  .icon_filter {
    width: 15px;
    height: 15px;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>

