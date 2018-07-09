import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: () => import('@/components/HelloWorld')
    },
    {
      path: '/a',
      name: 'page1',
      component: () => import('@/views/page1')
    },
    {
      path: '/b',
      name: 'page2',
      component: () => import('@/views/page2')
    },
    {
      path: '/c',
      name: 'page3',
      component: () => import('@/views/page3')
    }
  ]
})
