<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getOrders()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrders()"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格 -->
      <el-table :data="orders" border stripe>
        <el-table-column type="index" label="#" width="30"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100"
        ></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status == 0">
              未付款
            </el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat('yyyy-MM-dd hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="">
            <el-tooltip content="修改地址" placement="top" :enterable="false">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="showAddressDialog()"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="查看物流" placement="top" :enterable="false">
              <el-button
                size="mini"
                type="success"
                icon="el-icon-location"
                @click="showLogisticsDialog()"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 修改地址 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressClosed()"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="addressFormRules"
        label-width="80px"
      >
        <el-form-item label="省市区" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="citydata"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 查看物流 -->
    <el-dialog title="查看物流" :visible.sync="logisticsVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logistic"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata'
import kuaidi from './kuaidi'
export default {
  data() {
    return {
      // 订单查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单数据
      orders: [],
      // 订单总数
      total: 0,
      // 控制修改地址对话框的显示与隐藏
      addressVisible: false,
      // 修改地址表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址验证表单
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      citydata,
      logisticsVisible: false,
      logistic: kuaidi
    }
  },
  created() {
    this.getOrders()
  },
  methods: {
    // 获取订单列表
    async getOrders() {
      const { data: res } = await this.$http.get('/orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.orders = res.data.goods
      this.total = res.data.total
      this.$message.success('获取订单列表成功')
      console.log(res.data)
    },

    // 分页大小改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrders()
    },
    // 当前分页改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrders()
    },
    // 显示修改地址对话框
    showAddressDialog() {
      this.addressVisible = true
    },
    // 修改地址对话框关闭
    addressClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    showLogisticsDialog() {
      this.logisticsVisible = true
      this.getLogistic()
    },
    async getLogistic() {
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('查询物流失败')
      // }
      // this.logistic = res.data
    }
  }
}
</script>

<style lang="less" scoped></style>
