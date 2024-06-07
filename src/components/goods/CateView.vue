<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddCateDialog()">
            添加分类
          </el-button>
        </el-col>
      </el-row>
      <!-- 分类表格 -->
      <tree-table
        class="mgtop"
        ref="treeTable"
        index-text="#"
        :show-index="true"
        :data="cata_list"
        :columns="columns"
        border
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
      >
        <template slot="isok" scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="level" scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">
            二级
          </el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <template slot="option" scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
          >
            删除
          </el-button>
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed()"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <el-cascader
            v-model="parentCatePath"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              checkStrictly: true
            }"
            clearable
            ref="cascader"
          >
            <template slot-scope="{ node, data }">
              <div @click="cascaderClick(node, data)">
                <span>{{ data.cat_name }}</span>
                <span v-if="!node.isLeaf">({{ data.children.length }})</span>
              </div>
            </template>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed()"
    >
      <el-form
        :model="editCateForm"
        ref="editCateFormRef"
        :rules="editCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询分类参数
      queryInfo: {
        pagenum: 1,
        pagesize: 5
      },
      // 分类列表
      cata_list: [],
      // 分类总数
      total: 0,
      // 为table指定列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',

          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类层级，默认一级分类
        cat_level: 0
      },
      // 添加分类表单验证
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类
      parentCateList: [],
      // 当前选中的父级分类路径
      parentCatePath: [],
      // 控制编辑分类对话框的展开与隐藏
      editCateDialogVisible: false,
      // 编辑分类表单
      editCateForm: {
        cat_id: 0,
        cat_name: ''
      },
      // 编辑分类表单验证
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取分类列表
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.cata_list = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前页面改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDialog() {
      // 获取父级分类
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.parentCateList = res.data
    },
    // 发送添加分类请求
    async addCate() {
      const validate = await this.$refs.addCateFormRef
        .validate()
        .catch(err => err)
      // 表单验证不通过
      if (validate !== true) return
      // 表单验证通过，发送请求
      const { data: res } = await this.$http.post(
        '/categories',
        this.addCateForm
      )
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getCateList()
      this.addCateDialogVisible = false
    },
    // 关闭添加分类对话框
    addCateDialogClosed() {
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.parentCatePath = []
      this.$refs.addCateFormRef.resetFields()
    },
    // 级联选择框优化

    cascaderClick(node, data) {
      // 存放父级id列表
      this.parentCatePath = node.path
      // 显示当前路径
      this.$refs.cascader.checkedValue = node.path
      // 计算当前文本值
      this.$refs.cascader.computePresentText()
      // 设置addCateForm中的父类id
      this.addCateForm.cat_pid = data.cat_id
      // 根据node的path长度，判读addCateForm中cat_level的等级
      if (node.path.length === 1) {
        this.addCateForm.cat_level = 1
      } else if (node.path.length === 2) {
        this.addCateForm.cat_level = 2
      }
      // 隐藏下拉框
      this.$refs.cascader.toggleDropDownVisible(false)
      this.$message({
        message: '已选择：' + data.cat_name,
        type: 'success',
        duration: 1000
      })
    },

    // 展开编辑分类对话框
    async showEditCateDialog(id) {
      const { data: res } = await this.$http.get(`/categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 获取成功
      this.editCateForm.cat_id = id
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateDialogVisible = true
    },
    // 提交编辑分类请求
    async editCate() {
      const validate = await this.$refs.editCateFormRef
        .validate()
        .catch(err => err)
      if (validate !== true) {
        return
      }
      // 表单验证通过
      const { data: res } = await this.$http.put(
        `/categories/${this.editCateForm.cat_id}`,
        this.editCateForm
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 编辑成功
      this.$message.success(res.meta.msg)
      this.getCateList()
      this.editCateDialogVisible = false
    },
    // 关闭编辑分类对话框
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$messageBox
        .confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`/categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 删除成功
      this.$message.success(res.meta.msg)

      // 如果当前数据删除后，该页为空
      const totalPage = Math.ceil((this.total - 1) / this.queryInfo.pagesize)
      this.queryInfo.pagenum =
        this.queryInfo.pagenum >= totalPage ? totalPage : this.queryInfo.pagenum

      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.mgtop {
  margin-top: 20px;
  font-size: 12px;
}
.el-cascader {
  width: 100%;
}
</style>
