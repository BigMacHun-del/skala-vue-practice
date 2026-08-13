<script setup>
import { ref, computed, watch } from 'vue'
// Vite의 ?raw 쿼리로 SVG 원본을 문자열로 불러옴
import southKoreaSvgRaw from '@/assets/southKoreaHigh.svg?raw'

import BaseDashboardCard from './task3/BaseDashboardCard.vue'
import WeatherMapPanel from './task3/WeatherMapPanel.vue'
import SongRecommendationPanel from './task3/SongRecommendationPanel.vue'
import WeatherCityCard from './task3/WeatherCityCard.vue'

// 반응형 데이터는 부모가 소유하고 자식은 props로만 전달받는다 (단방향 데이터 흐름)
const rawCities = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', lat: 37.57, lon: 126.98 },
  { id: 'city_02', name: '수원', temp: 18, status: '비', lat: 37.26, lon: 127.01 },
  { id: 'city_03', name: '인천', temp: 24, status: '흐림', lat: 37.46, lon: 126.7 },
  { id: 'city_04', name: '대전', temp: -3, status: '눈', lat: 36.35, lon: 127.38 },
  { id: 'city_05', name: '대구', temp: 36, status: '맑음', lat: 35.87, lon: 128.6 },
  { id: 'city_06', name: '부산', temp: 33, status: '흐림', lat: 35.18, lon: 129.08 },
  { id: 'city_07', name: '울산', temp: -8, status: '강풍', lat: 35.54, lon: 129.32 },
  { id: 'city_08', name: '거제', temp: 22, status: '구름', lat: 34.88, lon: 128.62 },
  { id: 'city_09', name: '강릉', temp: 30, status: '맑음', lat: 37.75, lon: 128.9 },
  { id: 'city_10', name: '제주', temp: 19, status: '비', lat: 33.5, lon: 126.53 },
  { id: 'city_11', name: '평창', temp: -14, status: '폭설', lat: 37.37, lon: 128.39 },
  { id: 'city_12', name: '포항', temp: 35, status: '맑음', lat: 36.02, lon: 129.37 },
]

// SVG의 <path id="KR-xx" data-name="..."> 태그들을 정규식으로 파싱해 {id, name, d} 배열로 변환
const parseProvincePaths = (svgText) => {
  const pattern = /<path\s+d="([^"]+)"[^>]*\bid="([^"]+)"[^>]*\bdata-name="([^"]+)"/g
  const paths = []
  let match
  while ((match = pattern.exec(svgText)) !== null) {
    const [, d, id, name] = match
    paths.push({ id, name, d })
  }
  return paths
}

const provincePaths = parseProvincePaths(southKoreaSvgRaw)

const SVG_VIEW_BOX = { x: 79.59, y: -2, width: 800.82, height: 964 }

// 8개 광역시 실측 좌표로 최소제곱회귀한 메르카토르 투영 계수
const MERCATOR_FIT = {
  a: 139.99066283955688,
  b: -17465.10548928772,
  c: -8282.041815281516,
  d: 6057.964242923005,
}

// 위도/경도를 지도 SVG 좌표계의 x%, y%로 변환 (메르카토르 투영)
const toMapPosition = (lat, lon) => {
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2))

  const svgX = MERCATOR_FIT.a * lon + MERCATOR_FIT.b
  const svgY = MERCATOR_FIT.c * mercatorY + MERCATOR_FIT.d

  const x = ((svgX - SVG_VIEW_BOX.x) / SVG_VIEW_BOX.width) * 100
  const y = ((svgY - SVG_VIEW_BOX.y) / SVG_VIEW_BOX.height) * 100
  return { x, y }
}

const getWeatherAlert = (temp) => {
  if (temp >= 35) return { label: '폭염경보', class: 'heat-warning' }
  if (temp >= 33) return { label: '폭염주의보', class: 'heat-caution' }
  if (temp >= 28) return { label: '무더움', class: 'hot' }
  if (temp <= -12) return { label: '한파경보', class: 'cold-warning' }
  if (temp <= -5) return { label: '한파주의보', class: 'cold-caution' }
  if (temp <= 5) return { label: '쌀쌀함', class: 'cold' }
  return { label: '선선함', class: 'cool' }
}

const SONG_GUIDE = {
  'heat-warning': { emoji: '🥵', mood: '기록적인 폭염, 시원한 곡으로 열을 식혀보세요', tracks: [
    { title: 'Ice Cream', artist: 'BLACKPINK, Selena Gomez' },
    { title: '에어컨 (Feat. pH-1)', artist: '적재' },
  ] },
  'heat-caution': { emoji: '🌞', mood: '뜨거운 태양 아래, 청량한 팝으로 텐션을 올려보세요', tracks: [
    { title: 'Dynamite', artist: '방탄소년단' },
    { title: '여름 안에서', artist: '헤이즈, Colde' },
  ] },
  hot: { emoji: '☀️', mood: '무더운 하루엔 산뜻한 여름 노래 어때요', tracks: [
    { title: 'Beach House', artist: 'NCT DREAM' },
    { title: '여름이 들려주는 말', artist: '볼빨간사춘기' },
  ] },
  cool: { emoji: '🍃', mood: '선선한 날씨엔 편안한 어쿠스틱이 딱이에요', tracks: [
    { title: '밤편지', artist: '아이유' },
    { title: '가을 타나 봐', artist: '오반' },
  ] },
  cold: { emoji: '🧣', mood: '쌀쌀한 날씨엔 포근한 감성 발라드를 추천해요', tracks: [
    { title: '첫눈처럼 너에게 가겠다', artist: '에일리' },
    { title: '겨울잠', artist: '아이유' },
  ] },
  'cold-caution': { emoji: '❄️', mood: '한파주의보! 따뜻한 캐롤 감성 어떠세요', tracks: [
    { title: 'Last Christmas', artist: 'Wham!' },
    { title: '눈사람', artist: '볼빨간사춘기' },
  ] },
  'cold-warning': { emoji: '🥶', mood: '강력한 한파, 집에서 듣기 좋은 잔잔한 곡이에요', tracks: [
    { title: '봄날', artist: '방탄소년단' },
    { title: 'Snow Flower', artist: '방탄소년단, 박지민' },
  ] },
}

const legendItems = [
  { class: 'heat-warning', label: '폭염경보' },
  { class: 'heat-caution', label: '폭염주의보' },
  { class: 'hot', label: '무더움' },
  { class: 'cool', label: '선선함' },
  { class: 'cold', label: '쌀쌀함' },
  { class: 'cold-caution', label: '한파주의보' },
  { class: 'cold-warning', label: '한파경보' },
]

const menuItems = [
  { id: 'map', label: '지도' },
  { id: 'song', label: '노래 추천' },
  { id: 'cities', label: '도시 현황' },
]
const activeMenu = ref('map')

// rawCities에 지도 좌표(x, y)와 특보 등급(alert)을 미리 계산해 붙인 목록
const cityList = computed(() =>
  rawCities.map((city) => ({
    ...city,
    ...toMapPosition(city.lat, city.lon),
    alert: getWeatherAlert(city.temp),
  })),
)

// 폭염/한파 특보가 발효된 도시 수 (통계 카드용)
const heatAlertCount = computed(
  () => cityList.value.filter((c) => c.alert.class === 'heat-warning' || c.alert.class === 'heat-caution').length,
)
const coldAlertCount = computed(
  () => cityList.value.filter((c) => c.alert.class === 'cold-warning' || c.alert.class === 'cold-caution').length,
)

// 가장 더운 도시 (초기 선택 도시로 사용)
const hottestCity = computed(() => [...cityList.value].sort((a, b) => b.temp - a.temp)[0])

const selectedCityId = ref(null)

// 선택된 도시가 없으면 가장 더운 도시를 기본값으로 보여줌
const selectedCity = computed(() => cityList.value.find((c) => c.id === selectedCityId.value) ?? hottestCity.value)

const songRecommendation = computed(() => SONG_GUIDE[selectedCity.value.alert.class])

// 도시를 선택할 때마다 콘솔에 로그를 남겨 변화를 추적 (watch 실습)
watch(selectedCityId, (newId) => {
  if (!newId) return
  const city = cityList.value.find((c) => c.id === newId)
  console.log(`🎧 [도시 선택] ${city?.name}의 날씨에 맞는 노래를 추천합니다.`)
})

// 헤더 메뉴 클릭 시 해당 section으로 부드럽게 스크롤 이동
const scrollToSection = (sectionId) => {
  activeMenu.value = sectionId
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="weather-app">
    <header class="app-header">
      <div class="brand">
        <span class="brand-icon">🌦️</span>
        <span class="brand-name">웨더튠</span>
      </div>
      <nav class="menu-list">
        <button
          v-for="menu in menuItems"
          :key="menu.id"
          class="menu-item"
          :class="{ active: activeMenu === menu.id }"
          @click="scrollToSection(menu.id)"
        >
          {{ menu.label }}
        </button>
      </nav>
    </header>

    <main class="app-main">
      <section class="hero">
        <p class="hero-eyebrow">오늘의 특보 현황</p>
        <h1 class="hero-title">전국 {{ cityList.length }}개 도시 중<br />{{ heatAlertCount + coldAlertCount }}곳에 특보가 발효 중이에요</h1>

        <div class="stat-row">
          <div class="stat-card heat">
            <span class="stat-label">🔥 폭염특보</span>
            <span class="stat-value">{{ heatAlertCount }}곳</span>
          </div>
          <div class="stat-card cold">
            <span class="stat-label">❄️ 한파특보</span>
            <span class="stat-value">{{ coldAlertCount }}곳</span>
          </div>
        </div>
      </section>

      <!-- BaseDashboardCard는 카드 껍데기만 담당하고, 실제 내용은 slot으로 받은 WeatherMapPanel이 채운다 -->
      <BaseDashboardCard section-id="map" title="실시간 특보 지도" description="점을 눌러 도시별 기온과 추천곡을 확인해 보세요">
        <WeatherMapPanel
          :city-list="cityList"
          :selected-city-id="selectedCity.id"
          :province-paths="provincePaths"
          :legend-items="legendItems"
          @select-city="selectedCityId = $event"
        />
      </BaseDashboardCard>

      <BaseDashboardCard section-id="song" title="오늘 날씨에 어울리는 노래">
        <SongRecommendationPanel :city="selectedCity" :song="songRecommendation" />
      </BaseDashboardCard>

      <BaseDashboardCard section-id="cities" title="도시별 현황">
        <div class="city-grid">
          <WeatherCityCard
            v-for="city in cityList"
            :key="city.id"
            :city="city"
            :active="city.id === selectedCity.id"
            @select="selectedCityId = $event"
          />
        </div>
      </BaseDashboardCard>
    </main>
  </div>
</template>

<style scoped>
.weather-app {
  /* GitHub Dark 팔레트 - CSS 변수는 scoped여도 자식 컴포넌트까지 상속된다 */
  --gh-bg: #0d1117;
  --gh-bg-elevated: #161b22;
  --gh-bg-inset: #010409;
  --gh-border: #30363d;
  --gh-border-muted: #21262d;
  --gh-text: #e6edf3;
  --gh-text-secondary: #8b949e;
  --gh-text-muted: #6e7681;
  --gh-accent: #58a6ff;
  --gh-accent-subtle: rgba(56, 139, 253, 0.15);
  --gh-orange: #f78166;

  color: var(--gh-text);
  background: var(--gh-bg);
  border: 1px solid var(--gh-border-muted);
  border-radius: 12px;
  overflow: hidden;
  font-family: inherit;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--gh-bg);
  border-bottom: 1px solid var(--gh-border-muted);
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--gh-text);
}

.menu-list {
  display: flex;
  gap: 18px;
}

.menu-item {
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 8px 2px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gh-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-item:hover {
  color: var(--gh-text);
}

.menu-item.active {
  color: var(--gh-text);
  border-bottom-color: var(--gh-orange);
}

.app-main {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  padding: 4px 4px 8px;
}

.hero-eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gh-accent);
  margin-bottom: 8px;
}

.hero-title {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.4;
  color: var(--gh-text);
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  gap: 10px;
}

.stat-card {
  flex: 1;
  background: var(--gh-bg-elevated);
  border: 1px solid var(--gh-border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gh-text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gh-text);
}

.stat-card.heat .stat-value {
  color: #f85149;
}

.stat-card.cold .stat-value {
  color: #58a6ff;
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
</style>
