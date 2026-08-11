<script setup>
import { ref, computed, watch } from 'vue'

/**
 * 도시 원본 데이터
 * lat/lon: 지도 위 좌표 계산을 위한 대략적인 위도·경도 값
 */
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

// 지도 박스 안에서 위도/경도를 0~100% 좌표로 바꾸기 위한 기준 범위
const MAP_BOUNDS = { lonMin: 125.5, lonMax: 130.0, latMin: 32.8, latMax: 38.8 }

/**
 * 위도/경도를 지도 카드 안의 x%, y% 좌표로 변환
 * @param {number} lat
 * @param {number} lon
 * @returns {{x: number, y: number}}
 */
const toMapPosition = (lat, lon) => {
  const x = ((lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) * 100
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 100
  return { x, y }
}

// 기상청 폭염/한파 특보 기준을 단순화하여 기온별 등급을 판정
const getWeatherAlert = (temp) => {
  if (temp >= 35) return { label: '폭염경보', class: 'heat-warning' }
  if (temp >= 33) return { label: '폭염주의보', class: 'heat-caution' }
  if (temp >= 28) return { label: '무더움', class: 'hot' }
  if (temp <= -12) return { label: '한파경보', class: 'cold-warning' }
  if (temp <= -5) return { label: '한파주의보', class: 'cold-caution' }
  if (temp <= 5) return { label: '쌀쌀함', class: 'cold' }
  return { label: '선선함', class: 'cool' }
}

// 등급별 추천곡 데이터 (분위기 + 노래 2곡씩)
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

// 지도 범례에 표시할 등급 목록
const legendItems = [
  { class: 'heat-warning', label: '폭염경보' },
  { class: 'heat-caution', label: '폭염주의보' },
  { class: 'hot', label: '무더움' },
  { class: 'cool', label: '선선함' },
  { class: 'cold', label: '쌀쌀함' },
  { class: 'cold-caution', label: '한파주의보' },
  { class: 'cold-warning', label: '한파경보' },
]

// 헤더 메뉴 목록 (클릭하면 해당 section으로 스크롤 이동)
const menuItems = [
  { id: 'map', label: '지도' },
  { id: 'song', label: '노래 추천' },
  { id: 'cities', label: '도시 현황' },
]
const activeMenu = ref('map')

// rawCities에 지도 좌표(x, y)와 특보 등급(alert)을 미리 계산해서 붙여넣은 computed 목록
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

// 지도/목록에서 선택된 도시 id. 아직 선택 전이면 null
const selectedCityId = ref(null)

// 선택된 도시가 없으면 가장 더운 도시를 기본값으로 보여줌
const selectedCity = computed(() => cityList.value.find((c) => c.id === selectedCityId.value) ?? hottestCity.value)

// 선택된 도시의 특보 등급에 맞는 추천곡 정보
const songRecommendation = computed(() => SONG_GUIDE[selectedCity.value.alert.class])

// 도시를 선택할 때마다 콘솔에 로그를 남겨 변화를 추적 (watch 실습)
watch(selectedCityId, (newId) => {
  if (!newId) return
  const city = cityList.value.find((c) => c.id === newId)
  console.log(`🎧 [도시 선택] ${city?.name}의 날씨에 맞는 노래를 추천합니다.`)
})

/**
 * 헤더 메뉴 클릭 시 해당 section으로 부드럽게 스크롤 이동
 * @param {string} sectionId
 */
const scrollToSection = (sectionId) => {
  activeMenu.value = sectionId
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="weather-app">
    <!-- 상단 헤더: 로고 + 메뉴 목록 -->
    <header class="app-header">
      <div class="brand">
        <span class="brand-icon">🌦️</span>
        <span class="brand-name">웨더튠</span>
      </div>
      <!-- v-for로 메뉴 목록을 그리고, :class로 현재 활성 메뉴만 강조 표시 -->
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
      <!-- 상단 요약 히어로 영역 -->
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

      <!-- 지도 섹션 -->
      <section id="map" class="card map-section">
        <h2 class="section-title">실시간 특보 지도</h2>
        <p class="section-desc">점을 눌러 도시별 기온과 추천곡을 확인해 보세요</p>

        <div class="map-frame">
          <!-- 대략적인 한반도 형태를 나타내는 배경 도형 -->
          <div class="map-land"></div>
          <div class="map-jeju"></div>

          <!-- v-for + :key로 도시별 핀을 반복 렌더링, :style로 지도 위 좌표를 동적으로 지정 -->
          <button
            v-for="city in cityList"
            :key="city.id"
            class="map-pin"
            :class="{ selected: city.id === selectedCity.id }"
            :style="{ left: city.x + '%', top: city.y + '%' }"
            @click="selectedCityId = city.id"
          >
            <span class="pin-dot" :class="city.alert.class"></span>
            <span class="pin-label">{{ city.name }}</span>
          </button>
        </div>

        <ul class="legend">
          <li v-for="item in legendItems" :key="item.class" class="legend-item">
            <span class="legend-dot" :class="item.class"></span>{{ item.label }}
          </li>
        </ul>
      </section>

      <!-- 노래 추천 섹션 -->
      <section id="song" class="card song-section">
        <h2 class="section-title">오늘 날씨에 어울리는 노래</h2>

        <div class="selected-city">
          <span class="badge" :class="selectedCity.alert.class">{{ selectedCity.alert.label }}</span>
          <h3 class="selected-name">{{ selectedCity.name }}</h3>
          <p class="selected-desc">{{ selectedCity.status }} · 현재 기온 {{ selectedCity.temp }}°C</p>
        </div>

        <p class="song-mood">{{ songRecommendation.emoji }} {{ songRecommendation.mood }}</p>

        <ul class="song-list">
          <li v-for="track in songRecommendation.tracks" :key="track.title" class="song-item">
            <span class="song-title">{{ track.title }}</span>
            <span class="song-artist">{{ track.artist }}</span>
          </li>
        </ul>
      </section>

      <!-- 도시 목록 섹션 -->
      <section id="cities" class="card city-section">
        <h2 class="section-title">도시별 현황</h2>
        <div class="city-grid">
          <button
            v-for="city in cityList"
            :key="city.id"
            class="city-chip"
            :class="{ active: city.id === selectedCity.id }"
            @click="selectedCityId = city.id"
          >
            <span class="city-chip-name">{{ city.name }}</span>
            <span class="city-chip-temp">{{ city.temp }}°C</span>
            <span class="badge small" :class="city.alert.class">{{ city.alert.label }}</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.weather-app {
  /* GitHub Dark 테마 팔레트 */
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

/* 헤더 */
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

/* 본문 */
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

/* 카드 공통 */
.card {
  background: var(--gh-bg-elevated);
  border: 1px solid var(--gh-border);
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--gh-text);
  margin-bottom: 4px;
}

.section-desc {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
  margin-bottom: 16px;
}

/* 지도: 야간 위성사진 느낌 */
.map-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: radial-gradient(circle at 28% 18%, #0c1f18 0%, #060d10 45%, #010409 100%);
  border: 1px solid var(--gh-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.55);
}

/* 위성사진 특유의 옅은 스캔라인 질감 */
.map-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 3px);
  pointer-events: none;
}

.map-land {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #14301f 0%, #244a30 35%, #2f5c38 60%, #1c3722 100%);
  border: 1px solid rgba(88, 166, 255, 0.15);
  box-shadow: 0 0 30px rgba(63, 185, 80, 0.08) inset;
  /* 실제 한반도 해안선 느낌을 살리기 위해 촘촘한 점들로 울퉁불퉁하게 표현 (동해안은 완만하게, 서·남해안은 굴곡지게) */
  clip-path: polygon(
    /* 북쪽 경계 */
    30% 4%,
    40% 2%,
    50% 2%,
    62% 4%,
    /* 동해안 (완만) */
    70% 8%,
    76% 12%,
    80% 17%,
    83% 23%,
    85% 29%,
    87% 35%,
    88% 41%,
    87% 47%,
    85% 53%,
    87% 58%,
    84% 63%,
    79% 68%,
    /* 남해안 (굴곡) */
    73% 71%,
    76% 75%,
    68% 73%,
    63% 78%,
    56% 74%,
    58% 80%,
    49% 76%,
    44% 80%,
    36% 75%,
    39% 81%,
    29% 74%,
    24% 71%,
    18% 66%,
    /* 서해안 (굴곡) */
    14% 60%,
    19% 55%,
    13% 49%,
    18% 44%,
    12% 38%,
    17% 33%,
    13% 27%,
    19% 23%,
    14% 18%,
    20% 13%,
    16% 8%,
    23% 5%
  );
}

.map-jeju {
  position: absolute;
  left: 16%;
  top: 83%;
  width: 13%;
  height: 7%;
  background: linear-gradient(135deg, #14301f 0%, #244a30 60%, #1c3722 100%);
  border: 1px solid rgba(88, 166, 255, 0.15);
  border-radius: 50%;
}

.map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.pin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid rgba(1, 4, 9, 0.7);
  transition: transform 0.15s ease;
}

.map-pin.selected .pin-dot {
  transform: scale(1.4);
}

.pin-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--gh-text);
  background: rgba(1, 4, 9, 0.85);
  border: 1px solid var(--gh-border-muted);
  padding: 1px 5px;
  border-radius: 6px;
  white-space: nowrap;
}

/* 등급별 색상 (범례 점에 사용하는 기본값) - 야간 위성사진의 도시 불빛처럼 은은하게 발광 */
.legend-dot.heat-warning {
  background: #f85149;
}
.legend-dot.heat-caution {
  background: #db6d28;
}
.legend-dot.hot {
  background: #d29922;
}
.legend-dot.cool {
  background: #3fb950;
}
.legend-dot.cold {
  background: #58a6ff;
}
.legend-dot.cold-caution {
  background: #388bfd;
}
.legend-dot.cold-warning {
  background: #a371f7;
}

/* 등급별 색상 (지도 핀에 사용) - 은은한 발광으로 야간 위성사진의 도시 불빛 표현 */
.pin-dot.heat-warning {
  background: #f85149;
  box-shadow: 0 0 8px 1px rgba(248, 81, 73, 0.8);
}
.pin-dot.heat-caution {
  background: #db6d28;
  box-shadow: 0 0 8px 1px rgba(219, 109, 40, 0.8);
}
.pin-dot.hot {
  background: #d29922;
  box-shadow: 0 0 8px 1px rgba(210, 153, 34, 0.8);
}
.pin-dot.cool {
  background: #3fb950;
  box-shadow: 0 0 8px 1px rgba(63, 185, 80, 0.8);
}
.pin-dot.cold {
  background: #58a6ff;
  box-shadow: 0 0 8px 1px rgba(88, 166, 255, 0.8);
}
.pin-dot.cold-caution {
  background: #388bfd;
  box-shadow: 0 0 8px 1px rgba(56, 139, 253, 0.8);
}
.pin-dot.cold-warning {
  background: #a371f7;
  box-shadow: 0 0 8px 1px rgba(163, 113, 247, 0.8);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 16px;
  padding: 0;
  list-style: none;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--gh-text-secondary);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

/* 배지: GitHub 라벨 스타일 (테두리 + 옅은 배경 + 컬러 텍스트) */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.badge.small {
  padding: 2px 8px;
  font-size: 0.68rem;
}

.badge.heat-warning {
  color: #f85149;
  background: rgba(248, 81, 73, 0.15);
  border-color: rgba(248, 81, 73, 0.4);
}
.badge.heat-caution {
  color: #db6d28;
  background: rgba(219, 109, 40, 0.15);
  border-color: rgba(219, 109, 40, 0.4);
}
.badge.hot {
  color: #d29922;
  background: rgba(210, 153, 34, 0.15);
  border-color: rgba(210, 153, 34, 0.4);
}
.badge.cool {
  color: #3fb950;
  background: rgba(63, 185, 80, 0.15);
  border-color: rgba(63, 185, 80, 0.4);
}
.badge.cold {
  color: #58a6ff;
  background: rgba(88, 166, 255, 0.15);
  border-color: rgba(88, 166, 255, 0.4);
}
.badge.cold-caution {
  color: #388bfd;
  background: rgba(56, 139, 253, 0.15);
  border-color: rgba(56, 139, 253, 0.4);
}
.badge.cold-warning {
  color: #a371f7;
  background: rgba(163, 113, 247, 0.15);
  border-color: rgba(163, 113, 247, 0.4);
}

/* 노래 추천 */
.selected-city {
  margin-bottom: 14px;
}

.selected-name {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 8px 0 2px;
  color: var(--gh-text);
}

.selected-desc {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
}

.song-mood {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--gh-text-secondary);
  background: var(--gh-bg-inset);
  border: 1px solid var(--gh-border-muted);
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
}

.song-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--gh-bg-inset);
  border: 1px solid var(--gh-border-muted);
}

.song-title {
  font-weight: 700;
  color: var(--gh-text);
  font-size: 0.92rem;
}

.song-artist {
  font-size: 0.8rem;
  color: var(--gh-text-secondary);
}

/* 도시 목록 */
.city-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.city-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--gh-border);
  background: var(--gh-bg-inset);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.city-chip:hover {
  border-color: var(--gh-accent);
}

.city-chip.active {
  border-color: var(--gh-accent);
  background: var(--gh-accent-subtle);
}

.city-chip-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--gh-text);
}

.city-chip-temp {
  font-size: 0.8rem;
  color: var(--gh-text-secondary);
}
</style>
