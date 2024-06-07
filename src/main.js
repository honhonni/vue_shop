import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入element-ui组件样式
import 'element-ui/lib/theme-chalk/index.css'
// 引入 element 插件
import element from './components/element'

// 导入全局样式表
import './assets/css/global.css'

// 导入axios
import axios from 'axios'

// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'

// 注册树形表格
Vue.component('tree-table', TreeTable)

// 使用 element 组件
Vue.use(element)

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求头挂载 token
axios.interceptors.request.use(config => {
  // console.log('axios.config');
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
