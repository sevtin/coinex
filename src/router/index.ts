import { createRouter, createWebHistory } from 'vue-router'
import TradeView from '../views/trade/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trade',
      component: TradeView,
    }
  ]
})

export default router
