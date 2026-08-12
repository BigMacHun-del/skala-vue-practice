import { createRouter, createWebHistory } from 'vue-router'

// Weather Router 실습: 이전의 기본 스캐폴딩용 HomeView/AboutView 대신
// Weather*View들을 라우팅한다. main.js가 이 router를 app.use(router)로 전역 주입하므로
// App.vue를 AppTask4Code(<RouterLink> 내비게이션 + <RouterView>)로 갈아 끼우면 바로 동작한다.
//
// 지연 로딩(Lazy Loading): 컴포넌트를 상단에서 바로 import하지 않고 () => import('...') 형태의
// 함수로 감싸면, 해당 라우트에 실제로 처음 진입하는 시점에만 그 View의 코드 청크가 로드된다.
// (반대로 위쪽에서 `import HomeView from ...`처럼 즉시 import하면 앱 최초 로딩 시 전부 함께 번들링됨)
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/WeatherHomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    // :cityId → 동적 세그먼트(Dynamic Segment). /weather/city_08 로 들어오면
    // WeatherDetailView에서 useRoute().params.cityId === 'city_08' 로 읽을 수 있다.
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  {
    // 요구사항 6번: 본인이 추가한 View + 라우트
    path: '/ranking',
    name: 'ranking',
    component: () => import('../views/WeatherRankingView.vue'),
  },
  {
    // Catch-all Route: 위 라우트 중 하나도 매칭되지 않는 모든 나머지 경로를 흡수한다.
    // Vue Router 4+ 문법에서는 `*` 대신 이름 붙은 정규식 파라미터 `:pathMatch(.*)*`를 사용한다.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
