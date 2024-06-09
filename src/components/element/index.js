import Vue from 'vue'

import {
  Alert,
  Aside,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Cascader,
  Checkbox,
  CheckboxGroup,
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
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tag,
  Timeline,
  TimelineItem,
  Tooltip,
  Tree,
  Upload
} from 'element-ui'

const coms = [
  Alert,
  Aside,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Cascader,
  Checkbox,
  CheckboxGroup,
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
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tag,
  Timeline,
  TimelineItem,
  Tooltip,
  Tree,
  Upload
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
