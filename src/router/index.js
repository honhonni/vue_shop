import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginView from '../components/LoginView.vue'
import HomeView from '../components/HomeView.vue'
import WelcomeView from '../components/WelcomeView.vue'
import UsersView from '../components/users/UsersView.vue'
import RightsView from '../components/power/RightsView.vue'
import RolesView from '../components/power/RolesView.vue'
import CateView from '../components/goods/CateView.vue'
import ParamsView from '../components/goods/ParamsView.vue'
import GoodsView from '../components/goods/GoodsView.vue'
import AddView from '../components/goods/AddView.vue'
import OrderView from '../components/order/OrderView.vue'
import ReportView from '@/components/report/ReportView.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  {
    path: '/home',
    component: HomeView,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: WelcomeView },
      { path: '/users', component: UsersView },
      { path: '/rights', component: RightsView },
      { path: '/roles', component: RolesView },
      { path: '/categories', component: CateView },
      { path: '/params', component: ParamsView },
      { path: '/goods', component: GoodsView },
      { path: '/goods/add', component: AddView },
      { path: '/orders', component: OrderView },
      { path: '/reports', component: ReportView }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果前往首页，放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
