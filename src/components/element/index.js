import Vue from 'vue'

import { Button, Input, Form, FormItem, Message } from 'element-ui'

const coms = [Button, Input, Form, FormItem]

// 导入弹框提示组件
Vue.prototype.$message = Message

export default {
  install(Vue, options) {
    coms.map(c => {
      return Vue.component(c.name, c)
    })
  }
}
