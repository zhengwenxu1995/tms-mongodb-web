<template>
  <tms-frame
    class="tmw-collection"
    :display="{ header: true, footer: true, right: true }"
    :leftWidth="'20%'"
  >
    <template v-slot:header>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ name: 'home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{dbName}}</el-breadcrumb-item>
      </el-breadcrumb>
    </template>
    <template v-slot:center>
      <el-table :data="collections" stripe style="width: 100%">
        <el-table-column label="collection" width="180">
          <template slot-scope="scope">
            <router-link
              :to="{
                name: 'collection',
                params: { dbName, clName: scope.row.name }
              }"
              >{{ scope.row.name }}</router-link
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="名称"
          width="180"
        ></el-table-column>
        <el-table-column prop="description" label="说明"></el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              @click="editCollection(scope.row, scope.$index)"
              type="text"
              size="mini"
              >修改</el-button
            >
            <el-button
              @click="handleCollection(scope.row)"
              type="text"
              size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template v-slot:right>
      <el-button @click="createCollection">添加文件</el-button>
    </template>
  </tms-frame>
</template>

<script>
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Frame, Flex } from 'tms-vue-ui'
Vue.use(Frame).use(Flex)
import CollectionEditor from '../components/CollectionEditor.vue'

export default {
  name: 'Database',
  props: ['dbName'],
  computed: {
    ...mapState(['collections'])
  },
  data() {
    return {}
  },
  methods: {
    ...mapMutations([
      'appendCollection',
      'updateCollection'
    ]),
    ...mapActions([
      'listCollection',
      'removeCollection'
    ]),
    createCollection() {
      let editor = new Vue(CollectionEditor)
      editor.open('create', this.dbName).then(newCollection => {
        this.appendCollection({collection: newCollection})
      })
    },
    editCollection(collection, index) {
      let editor = new Vue(CollectionEditor)
      editor.open('update', this.dbName, {...collection, fromDatabase: collection.name}).then(newCollection => {
        this.updateCollection({collection: newCollection, index})
      })
    },
    handleCollection(collection) {
      this.$customeConfirm('集合', () => {
        return this.removeCollection({db: this.dbName, collection})
      })
    },
  },
  mounted() {
    this.listCollection({db: this.dbName})
  }
}
</script>
