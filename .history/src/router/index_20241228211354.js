import { createRouter, createWebHistory } from 'vue-router'
import ProjectView from '../views/ProjectView.vue';
import ProjectDetailView from '../views/ProjectDetailView.vue'; // 프로젝트 세부 정보 페이지
import HeroSection from '../views/HeroSection.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'projects',
      component: ProjectView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },    
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: ProjectDetailView,
      props: true, // 라우트 매개변수를 컴포넌트에 전달
    },
  ],
})

export default router
