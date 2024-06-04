<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" />
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠与展开按钮 -->
        <div class="togger-btn" @click="toggerCollapse">|||</div>
        <el-menu
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
          router
        >
          <el-submenu
            :index="subItem.id + ''"
            v-for="subItem in menuList"
            :key="subItem.id"
          >
            <template slot="title">
              <i :class="iconsObj[subItem.id]"></i>
              <span>{{ subItem.authName }}</span>
            </template>

            <el-menu-item
              :index="'/' + item.path"
              v-for="item in subItem.children"
              :key="item.id"
              @click="saveNavState('/' + item.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{ item.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录F
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取侧边栏菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 侧边栏折叠与展开
    toggerCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-header {
    background-color: #3f3d41;
    display: flex;
    justify-content: space-between;

    align-items: center;
  }
  .el-aside {
    background-color: #333744;
    .togger-btn {
      background-color: #4a5064;
      text-align: center;
      color: #fff;
      font-size: 10px;
      line-height: 24px;
      cursor: pointer;
      user-select: none;
    }
    .el-menu {
      border-right: none;
    }
    .iconfont {
      margin-right: 10px;
    }
  }
  .el-main {
    background-color: #eee;
  }
}
</style>
