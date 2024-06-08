<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>

      <!-- 选择商品分类 -->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="checkKeys"
            :options="cateList"
            :props="props"
            @change="handleChange()"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- table标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数页面 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isDisabled"
            @click="showAddParamsDialog()"
          >
            添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyParams" border stripe>
            <!-- 展开具体参数值 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(value, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  disable-transitions
                  @close="handleClose(scope.row, i)"
                >
                  {{ value }}
                </el-tag>

                <!-- 输入标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作" width="200px">
              <template scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性页面 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isDisabled"
            @click="showAddParamsDialog()"
          >
            添加属性
          </el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyParams" border stripe>
            <!-- 展开具体属性值 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(value, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  disable-transitions
                  @close="handleClose(scope.row, i)"
                >
                  {{ value }}
                </el-tag>

                <!-- 输入标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作" width="200px">
              <template scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数/静态属性 -->
    <el-dialog
      :title="'添加' + titleName"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClosed()"
    >
      <el-form
        ref="addParamsFormRef"
        :model="addParamsForm"
        :rules="addParamsFormRules"
        label-width="100px"
      >
        <el-form-item :label="titleName + ':'" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑动态参数/静态属性 -->
    <el-dialog
      :title="'编辑' + titleName"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClosed()"
    >
      <el-form
        ref="editParamsFormRef"
        :model="editParamsForm"
        :rules="editParamsFormRules"
        label-width="100px"
      >
        <el-form-item :label="titleName + ':'" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表
      cateList: [],
      checkKeys: [],
      // 商品分类级联选择配置
      props: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 当前选中的标签页
      activeName: 'many',
      // 动态参数
      manyParams: [],
      // 静态参数
      onlyParams: [],
      // 控制添加动态参数/静态属性对话框的展开或隐藏
      addParamsDialogVisible: false,
      // 添加动态参数/静态属性表单
      addParamsForm: {
        attr_name: ''
      },
      // 添加动态参数/静态属性表单验证
      addParamsFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 控制编辑动态参数/静态属性对话框的展开或隐藏
      editParamsDialogVisible: false,
      // 添加动态参数/静态属性表单
      editParamsForm: {
        attr_id: '',
        attr_name: ''
      },
      // 添加动态参数/静态属性表单验证
      editParamsFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 获取参数列表
    async getParams() {
      const { data: res } = await this.$http.get(
        `/categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功

      res.data.forEach(item => {
        // 如果为空则置为空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制输入标签的显示与切换
        item.inputVisible = false
        // 输入标签的值
        item.inputValue = ''
      })
      if (this.activeName === 'only') {
        this.onlyParams = res.data
      } else {
        this.manyParams = res.data
      }
    },
    // 级联选择框变化触发函数
    handleChange() {
      // 如果选中的不是三级，则重置
      if (this.checkKeys.length !== 3) {
        this.checkKeys = []
        this.manyParams = []
        this.onlyParams = []
        return
      }
      // 选中了三级分类，发起请求
      this.getParams()
    },
    // 点击了标签页触发函数
    handleClick() {
      // console.log(this.activeName)

      this.getParams()
    },
    // 显示添加动态参数/静态属性对话框
    showAddParamsDialog() {
      this.addParamsDialogVisible = true
    },
    // 关闭添加动态参数/静态属性对话框触发函数
    addParamsDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 发送添加动态参数/静态属性请求
    async addParams() {
      const validate = await this.$refs.addParamsFormRef
        .validate()
        .catch(err => err)
      if (validate !== true) return
      const { data: res } = await this.$http.post(
        `/categories/${this.cateId}/attributes`,
        {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        }
      )
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success('添加成功')
      this.getParams()
      this.addParamsDialogVisible = false
    },
    // 显示编辑动态参数/静态属性对话框
    async showEditParamsDialog(id) {
      // 获取当前参数名称
      const { data: res } = await this.$http.get(
        `/categories/${this.cateId}/attributes/${id}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },
    // 关闭添加动态参数/静态属性对话框触发函数
    editParamsDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 发送编辑动态参数/静态属性请求
    async editParams() {
      const validate = await this.$refs.editParamsFormRef
        .validate()
        .catch(err => err)
      if (validate !== true) return
      const { data: res } = await this.$http.put(
        `/categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
        {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('编辑成功')
      this.getParams()
      this.editParamsDialogVisible = false
    },
    // 删除参数
    async deleteParams(param) {
      const confirmResult = await this.$messageBox
        .confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(
        `/categories/${this.cateId}/attributes/${param.attr_id}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      this.getParams()
    },
    // 显示输入标签框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 处理输入标签回车或失去焦点事件
    handleInputConfirm(row) {
      if (row.inputValue) {
        row.attr_vals.push(row.inputValue)

        row.inputValue = ''
        this.submitVals(row, null, null)
      }
      row.inputVisible = false
    },
    // 删除标签
    handleClose(row, i) {
      const value = row.attr_vals.splice(i, 1)
      this.submitVals(row, i, value)
    },
    // 提交删除或添加标签的请求
    // index为null表示添加标签
    // index不为null表示删除标签
    async submitVals(data, index, value) {
      const { data: res } = await this.$http.put(
        `/categories/${this.cateId}/attributes/${data.attr_id}`,
        {
          attr_name: data.attr_name,
          attr_sel: this.activeName,
          attr_vals: index
            ? data.attr_vals.join(' ')
            : data.attr_vals.join(' ') + ' ' + data.inputValue
        }
      )
      if (res.meta.status === 200) {
        return this.$message.success('修改标签成功')
      }
      // 失败的话
      if (index === null) {
        data.attr_vals.pop()
      } else {
        // 删除失败后添加回去，因为动画效果而出现闪动现象，取消动画效果即可
        data.attr_vals.splice(index, 0, value[0])
      }

      this.$message.error('修改标签失败')
    }
  },
  computed: {
    // 如果级联选择框选中了三级分类，返回false，否则true
    isDisabled() {
      if (this.checkKeys.length === 3) {
        return false
      } else {
        return true
      }
    },
    // 如果级联选择框选中了三级分类，返回分类id
    cateId() {
      if (this.checkKeys.length === 3) {
        return this.checkKeys[2]
      } else {
        return null
      }
    },
    // 返回当前tab标题
    titleName() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
}

.el-tag + .el-tag {
  margin: 10px;
}
.button-new-tag {
  margin: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin: 10px;
  vertical-align: middle;
}
</style>
