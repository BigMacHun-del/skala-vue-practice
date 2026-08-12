import { createRouter, createWebHistory } from 'vue-router'

// project(WeatherTune) 라우팅: 메인 화면은 그대로 '/'에서 보여주고,
// 도시 카드의 "🔗 공유 링크"를 누르면 그 도시 하나만 보여주는 /city/:cityId로 이동한다.
// (task4 Weather Router 실습 라우트는 src/RouterTask4Code에 백업해뒀다 - App.vue를
//  AppTask4Code로 갈아 끼워서 그 실습을 다시 보려면 이 파일 내용도 그걸로 같이 바꿔야 한다)
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/project/WeatherMusicApp.vue'),
  },
  {
    // :cityId → 동적 세그먼트. /city/city_08 로 들어오면 CityDetailView에서
    // useRoute().params.cityId === 'city_08' 로 읽어서 해당 도시만 보여준다.
    path: '/city/:cityId',
    name: 'city-detail',
    component: () => import('../components/project/CityDetailView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
