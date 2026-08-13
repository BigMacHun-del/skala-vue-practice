import { createRouter, createWebHistory } from 'vue-router'

// WeatherTune 라우팅: 메인 화면 '/', 공유용 도시 상세 '/city/:cityId', 거제 이스터에그 페이지들
// (task4 실습 라우트는 src/RouterTask4Code에 백업)
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/project/WeatherMusicApp.vue'),
  },
  {
    path: '/city/:cityId',
    name: 'city-detail',
    component: () => import('../components/project/CityDetailView.vue'),
  },
  {
    path: '/geoje',
    name: 'geoje-home',
    component: () => import('../components/project/geoje/GeojeHomeView.vue'),
  },
  {
    path: '/geoje/:zoneId',
    name: 'geoje-zone',
    component: () => import('../components/project/geoje/GeojeZoneDetailView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
