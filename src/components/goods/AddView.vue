<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      ></el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="80px"
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked()"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name'
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyParams"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyParams"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add()">
              添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    const checkPrice = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('商品价格必须大于0'))
      } else {
        callback()
      }
    }

    const checkNumber = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('商品价格必须大于0'))
      } else {
        callback()
      }
    }
    const checkWeight = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('商品价格必须大于0'))
      } else {
        callback()
      }
    }
    return {
      // 当前步骤索引
      activeIndex: '0',
      // 添加商品表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类数组
        goods_cat: [],
        // 商品图片列表
        pics: [],
        // 商品的详情介绍
        goods_introduce: '',
        attrs: []
      },
      // 添加商品验证表单
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: checkPrice, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: checkWeight, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 动态参数
      manyParams: [],
      // 静态属性
      onlyParams: [],
      // 上传图片的url
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制图片预览对话框的显示与隐藏
      previewDialogVisible: false,
      // 预览图片的地址
      previewPath: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
    },
    // 商品分类切换事件
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换标签页的钩子
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 切换标签页后的事件
    async tabClicked() {
      if (this.activeIndex === '1' && this.addForm.goods_cat.length === 3) {
        // 获取动态参数
        const { data: res } = await this.$http.get(
          `/categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.manyParams = res.data
      } else if (
        this.activeIndex === '2' &&
        this.addForm.goods_cat.length === 3
      ) {
        // 获取静态属性
        const { data: res } = await this.$http.get(
          `/categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        }
        this.onlyParams = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移出图片的操作
    handleRemove(file) {
      // 1. 获取file中的临时存放路径
      const filePath = file.response.data.tmp_path
      // 2. 找到pics中的该图片的索引
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用splice方法删除图片
      this.addForm.pics.splice(index, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      this.addForm.pics.push({
        pic: response.data.tmp_path
      })
    },
    async add() {
      const validate = await this.$refs.addFormRef.validate().catch(err => err)
      if (validate !== true) {
        return this.$message.error('请填写必要的表单项')
      }
      // 添加之前对表单进行处理

      // 深拷贝 lodash  cloneDeep(obj)
      this.addForm.goods_cat = this.addForm.goods_cat.join(',')
      // 处理动态参数和静态属性
      this.manyParams.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })
      this.onlyParams.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })
      console.log(this.addForm)
      const { data: res } = await this.$http.post('/goods', this.addForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加失败')
      }
      this.$message.success('添加成功')
      this.$router.push('/goods')
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 0 0 10px !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin: 15px;
}
</style>
