<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
  >
    <el-input placeholder="自定义选中列的值，不填则值为空" v-model="input" class="input-with-select">
      <el-select v-model="select" slot="prepend" placeholder="选择列" @change="handleSelect" clearable filterable> 
        <el-option v-for="(s, k) in collection.schema.body.properties" :key="k" :prop="k" :label="s.title" :value="k"></el-option>
      </el-select>
    </el-input>
    <div class="tmw-tags">
      <el-tag v-for="tag in tags" :key="tag.id" closable :disable-transitions="false" @close="removeTag(tag)">{{tag.label}}:{{tag.value}}</el-tag>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="success" @click="handleButton">添加</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </div>
  </el-dialog>
</template>
<script>
import Vue from 'vue'
import { Dialog, Message } from 'element-ui'
Vue.use(Dialog)

export default {
  name: 'ColumnValueEditor',
  props: {
    dialogVisible: { default: true }
  },
  data() {
    return {
      destroyOnClose: true,
      closeOnClickModal: false,
      collection: null,
      select: "",
      input: "",
      column: {},
      tags: []
    }
  },
  methods: {
    handleSelect() {
      let value = this.column[this.select]
      this.input = value ? value : ""
    },
    handleButton() {
      if (!this.select) {
        Message.info({ message: '请选择条件'})
        return false
      }
      this.$set(this.column, this.select, this.input.replace(/^\s+|\s+$/g,""))
      if (this.tags.length) {
        this.tags.forEach(tag => {
          if (tag && tag.id===this.select) {
            tag.value = this.input
          } 
        })
        if (this.tags.every(ele => ele.id !== this.select)) {
          this.addColumn();
        }
      } else {
        this.addColumn();
      }
    },
    addColumn() {
      this.tags.push({
        id: this.select,
        label: this.collection.schema.body.properties[this.select].title,
        value: this.input
      })
      this.select = ""
      this.input = ""
    },
    removeTag(tag) {
      this.tags.forEach((item, index) => {
        if (item.id===tag.id) {
          this.tags.splice(index, 1)
          if (this.select===tag.id) {
            this.select = ""
            this.input = ""
          }
          delete this.column[tag.id]
        }
      })
    },
    onSubmit() {
      this.$emit('submit', this.column)
    },
    open(collection) {
      this.collection = collection
      this.$mount()
      document.body.appendChild(this.$el)
      return new Promise(resolve => {
        this.$on('submit', column => {
          this.dialogVisible = false
          resolve(column)
        })
      })
    }
  }
}
</script>
