import { createRouter, createWebHistory } from 'vue-router'
import ProjectView from '../views/ProjectView.vue';
import HeaderView from '../views/HeaderView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HeaderView,
    },
    {
      path: '/about',
      name: 'about'
    },    
    {
      path: '/projects',
      name: 'projects',
      component: ProjectView
    }
  ],
})

export default router
