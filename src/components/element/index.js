import Vue from 'vue'

import {
  Aside,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Col,
  Container,
  Dialog,
  Form,
  FormItem,
  Header,
  Input,
  Main,
  Menu,
  MenuItem,
  Message,
  MessageBox,
  Option,
  Pagination,
  Row,
  Select,
  Submenu,
  Switch,
  Table,
  TableColumn,
  Tag,
  Tooltip,
  Tree
} from 'element-ui'

const coms = [
  Aside,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Col,
  Container,
  Dialog,
  Form,
  FormItem,
  Header,
  Input,
  Main,
  Menu,
  MenuItem,
  Option,
  Pagination,
  Row,
  Select,
  Submenu,
  Switch,
  Table,
  TableColumn,
  Tag,
  Tooltip,
  Tree
]

// 导入弹框提示组件
Vue.prototype.$message = Message
Vue.prototype.$messageBox = MessageBox

export default {
  install(Vue, options) {
    coms.map(c => {
      return Vue.component(c.name, c)
    })
  }
}
