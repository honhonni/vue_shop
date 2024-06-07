<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="addRoleDialogVisible = true">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 权限详情页面 -->
            <el-row
              v-for="(item1, index) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5" style="text-align: center">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级，三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index) in item1.children"
                  :key="item2.id"
                  :class="[index === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6" style="text-align: center">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditRoleDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRoleDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClose()"
    >
      <!-- 表单区域 -->
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        :rules="addRoleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClose()"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        :rules="editRoleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配权限"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed()"
    >
      <el-tree
        :data="rightsTree"
        :props="rightsProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defaultCheckedKeys"
        ref="rightsTree"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoles()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制添加角色对话框的展开与关闭
      addRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 6, message: '角色名称为 1-6 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '角色描述为 1-10 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制添加角色对话框的展开与关闭
      editRoleDialogVisible: false,
      // 编辑角色表单
      editRoleForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色表单验证
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 6, message: '角色名称为 1-6 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '角色描述为 1-10 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制分配权限对话框的展开与关闭
      setRoleDialogVisible: false,
      // 当前设置权限的角色id
      currend_id: '',
      // 权限树
      rightsTree: [],
      // 权限数配置对象
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      // 初始选中的权限数组
      defaultCheckedKeys: []
    }
  },
  created() {
    this.getRolesList()
    this.getRightsTree()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.rolesList = res.data
    },
    // 添加角色
    async addRole() {
      const { data: res } = await this.$http.post('/roles', this.addRoleForm)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      // 添加成功
      this.$message.success(res.meta.msg)
      this.getRolesList()
      // 关闭对话框
      this.addRoleDialogVisible = false
    },
    // 关闭添加角色对话框时，重置表单
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields()
    },

    // 打开编辑角色
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get(`/roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 获取成功
      this.editRoleForm = res.data
      this.$message.success(res.meta.msg)
      this.editRoleDialogVisible = true
    },
    // 提交编辑申请
    async editRole() {
      this.editRoleDialogVisible = false
      const { data: res } = await this.$http.put(
        `/roles/${this.editRoleForm.roleId}`,
        this.editRoleForm
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('编辑成功')
      // 重新获取列表
      this.getRolesList()
    },
    // 关闭编辑角色对话框时，重置表单
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 删除角色
    async deleteRole(id) {
      const result = await this.$messageBox
        .confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .catch(err => err)
      if (result === 'confirm') {
        const { data: res } = await this.$http.delete(`/roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 重新获取列表
        this.getRolesList()
      }
    },
    // 删除指定角色下的指定权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$messageBox
        .confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .catch(err => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }
      const { data: res } = await this.$http.delete(
        `/roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('杀出成功')

      // this.getRolesList(),导致页面table重新渲染
      role.children = res.data
    },
    async getRightsTree() {
      const { data: res } = await this.$http.get('/rights/tree')
      this.rightsTree = res.data
    },
    // 打开分配权限对话框
    showSetRoleDialog(role) {
      this.getRightsLeaves(role, this.defaultCheckedKeys)
      this.$nextTick(() => {
        this.$refs.rightsTree.setCheckedKeys(this.defaultCheckedKeys)
      })
      // 重新获取rightsTree也能刷新
      // this.getRightsTree()
      this.setRoleDialogVisible = true
      this.currend_id = role.id
    },
    // 递归获取三级权限
    getRightsLeaves(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getRightsLeaves(item, arr)
      })
    },
    // 关闭权限设置窗口
    setRoleDialogClosed() {
      this.defaultCheckedKeys = []
      // 手动刷新，防止闪烁
      this.$refs.rightsTree.setCheckedKeys(this.defaultCheckedKeys)
    },
    // 角色授权
    async setRoles() {
      const rights = [
        ...this.$refs.rightsTree.getCheckedKeys(),
        ...this.$refs.rightsTree.getHalfCheckedKeys()
      ]
      const { data: res } = await this.$http.post(
        `/roles/${this.currend_id}/rights`,
        {
          rids: rights.join(',')
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
