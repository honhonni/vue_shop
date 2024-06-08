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

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 注册树形表格
Vue.component('tree-table', TreeTable)

// 注册富文本编辑器
Vue.use(VueQuillEditor)

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

// 关闭生产环境中不必要的输出
Vue.config.productionTip = false

// 配置时间过滤器
Vue.filter('dateFormat', (date, format) => {
  // 特殊string格式
  if (typeof date === 'string') {
    var mts = date.match(/(\/Date\((\d+)\)\/)/)
    if (mts && mts.length >= 3) {
      date = parseInt(mts[2])
    }
  }
  date = new Date(parseInt(date))
  if (!date || date.toUTCString() === 'Invalid Date') {
    return ''
  }
  var map = {
    M: date.getMonth() + 1, // 月份
    d: date.getDate(), // 日
    h: date.getHours(), // 小时
    m: date.getMinutes(), // 分
    s: date.getSeconds(), // 秒
    q: Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
    var v = map[t]
    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v
        // v = v.substr(v.length - 2)
        v = v.substring(v.length - 2)
      }
      return v
    } else if (t === 'y') {
      // return (date.getFullYear() + '').substr(4 - all.length)
      return (date.getFullYear() + '').substring(4 - all.length)
    }
    return all
  })
  return format
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
