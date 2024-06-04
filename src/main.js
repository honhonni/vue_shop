import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入字体图标
import './assets/iconfont/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

// 导入element-ui组件样式
import 'element-ui/lib/theme-chalk/index.css'
// 引入 element 插件
import element from './components/element'

// 导入axios
import axios from 'axios'

// 使用 element 组件
Vue.use(element)

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
