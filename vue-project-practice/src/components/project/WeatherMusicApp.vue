<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeatherCities, SONG_GUIDE, legendItems } from '@/composables/useWeatherCities'
import { useFavoritesStore } from '@/stores/favoritesStore'

import AppHeader from './AppHeader.vue'
import HeroSection from './HeroSection.vue'
import SearchBar from './SearchBar.vue'
import WeatherMapSection from './WeatherMapSection.vue'
import CityWeatherCard from './CityWeatherCard.vue'
import SongPlayerSection from './SongPlayerSection.vue'
import WeatherTrendChart from './WeatherTrendChart.vue'
import ShareCardSection from './ShareCardSection.vue'
import FavoriteCities from './FavoriteCities.vue'
import EasterEggModal from './EasterEggModal.vue'
import KmaAlertBanner from './KmaAlertBanner.vue'

// 도시 목록/날씨/지도 좌표는 CityDetailView.vue와 공유하는 composables/useWeatherCities.js에서 가져온다.
const { cityList, isLoading, loadError, provincePaths, dailyState, ensureDaily } = useWeatherCities()

// 🥚 거제 이스터에그 히든 트랙 (자세한 설명은 EasterEggModal.vue)
const EASTER_EGG_SONG = {
  tracks: [
    { title: 'LOVE ATTACK', artist: '리센느 (RESCENE)' },
    { title: 'Pretty Girl', artist: '리센느 (RESCENE)' },
  ],
}

// 다크/라이트 테마 (localStorage에 저장해서 다음 방문에도 유지)
const THEME_KEY = 'weathertune-theme'
const isDark = ref(true)
const toggleTheme = () => {
  isDark.value = !isDark.value
}
watch(isDark, (value) => localStorage.setItem(THEME_KEY, value ? 'dark' : 'light'))

const favoritesStore = useFavoritesStore()

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) isDark.value = savedTheme === 'dark'
})

const heatAlertCount = computed(
  () => cityList.value.filter((c) => c.alert.class === 'heat-warning' || c.alert.class === 'heat-caution').length,
)
const coldAlertCount = computed(
  () => cityList.value.filter((c) => c.alert.class === 'cold-warning' || c.alert.class === 'cold-caution').length,
)
const rainyCount = computed(() => cityList.value.filter((c) => c.isRain || c.isSnow).length)

const hottestCity = computed(() => [...cityList.value].sort((a, b) => b.temp - a.temp)[0])
const selectedCityId = ref(null)
const selectedCity = computed(() => cityList.value.find((c) => c.id === selectedCityId.value) ?? hottestCity.value)
const songRecommendation = computed(() => SONG_GUIDE[selectedCity.value.alert.class])

// 선택된 도시가 바뀔 때마다 그 도시의 예보를 불러온다 (immediate: true로 첫 진입 시에도 실행)
watch(() => selectedCity.value.id, (cityId) => ensureDaily(cityId), { immediate: true })

const favoriteCityObjects = computed(() => cityList.value.filter((c) => favoritesStore.isFavorite(c.id)))

const selectCity = (cityId) => {
  selectedCityId.value = cityId
  trackGeojeCombo(cityId)
}

// 🥚 거제를 5번 연속 클릭하면 히든 트랙 공개
const showEasterEgg = ref(false)
const geojeClickCount = ref(0)
let lastGeojeClickAt = 0

const trackGeojeCombo = (cityId) => {
  const city = cityList.value.find((c) => c.id === cityId)
  if (city?.name !== '거제') {
    geojeClickCount.value = 0
    return
  }

  const now = Date.now()
  // 1.2초 안에 다시 눌러야 연속 클릭으로 인정
  geojeClickCount.value = now - lastGeojeClickAt > 1200 ? 1 : geojeClickCount.value + 1
  lastGeojeClickAt = now

  if (geojeClickCount.value >= 5) {
    showEasterEgg.value = true
    geojeClickCount.value = 0
  }
}

// 지역 검색. searchQuery는 SearchBar.vue와 v-model:query로 연결된다.
const searchQuery = ref('')

const searchMatches = computed(() => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return []
  return cityList.value.filter((city) => city.name.includes(keyword))
})

// 드롭다운은 최대 6개까지만
const searchSuggestions = computed(() => searchMatches.value.slice(0, 6))

// 지도 위에서 검색어와 매칭되는 핀만 강조 (검색어 없으면 null = 강조 없음)
const searchHighlightIds = computed(() => (searchQuery.value.trim() ? new Set(searchMatches.value.map((c) => c.id)) : null))

watch(searchQuery, (keyword) => {
  if (!keyword) return
  console.log(`🔍 [검색] "${keyword}" → ${searchMatches.value.length}개 도시 매칭`)
})

// 검색 결과를 클릭하면 그 도시를 선택하고 지도 섹션으로 이동, 검색창은 비운다
const selectSearchResult = (cityId) => {
  selectCity(cityId)
  searchQuery.value = ''
  scrollToSection('map')
}

// 내 위치와 가장 가까운 도시 찾기 (Geolocation API)
const locating = ref(false)
const locateStatus = ref('')

// 두 위경도 사이 거리(km) - 하버사인 공식
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const locateMe = () => {
  if (!navigator.geolocation) {
    locateStatus.value = '이 브라우저는 위치 정보 기능을 지원하지 않아요.'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      let nearestCity = null
      let shortestDistance = Infinity
      for (const city of cityList.value) {
        const distance = haversineDistanceKm(latitude, longitude, city.lat, city.lon)
        if (distance < shortestDistance) {
          shortestDistance = distance
          nearestCity = city
        }
      }
      if (nearestCity) {
        selectedCityId.value = nearestCity.id
        locateStatus.value = `현재 위치와 가장 가까운 도시는 ${nearestCity.name}이에요 (약 ${Math.round(shortestDistance)}km)`
        scrollToSection('map')
      }
      locating.value = false
    },
    () => {
      locateStatus.value = '위치 정보를 가져오지 못했어요. 브라우저 위치 권한을 확인해 주세요.'
      locating.value = false
    },
    { timeout: 8000 },
  )
}

const scrollToSection = (sectionId) => {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="weather-music-app" :class="isDark ? 'theme-dark' : 'theme-light'">
    <!-- props down, events up: 로컬 상태는 이 컴포넌트가 소유하고 자식에는 props로 내려준다 -->
    <AppHeader :is-dark="isDark" :favorite-count="favoriteCityObjects.length" @toggle-theme="toggleTheme" @navigate="scrollToSection" />

    <!-- 기상청 특보 API 연동 - 전국 단위라 별도 배너로 뺐다 -->
    <KmaAlertBanner />

    <HeroSection
      :city-count="cityList.length"
      :warning-count="heatAlertCount + coldAlertCount"
      :rainy-count="rainyCount"
      :is-loading="isLoading"
      :locating="locating"
      :locate-status="locateStatus"
      @locate-me="locateMe"
    />

    <SearchBar v-model:query="searchQuery" :suggestions="searchSuggestions" @select-city="selectSearchResult" />

    <main class="sections">
      <p v-if="loadError" class="load-error">⚠️ {{ loadError }}</p>

      <section id="map" class="section-block">
        <h2 class="block-title">실시간 특보 지도</h2>
        <p class="block-desc">점을 눌러 도시를 선택하면 강수 상태와 추천곡이 함께 바뀌어요.</p>
        <WeatherMapSection
          :city-list="cityList"
          :selected-city-id="selectedCity.id"
          :province-paths="provincePaths"
          :legend-items="legendItems"
          :highlight-ids="searchHighlightIds"
          @select-city="selectCity"
        />
      </section>

      <section id="trend" class="section-block">
        <h2 class="block-title">{{ selectedCity.name }} 기온 트렌드</h2>
        <p class="block-desc">OpenWeatherMap 5일 예보 기반</p>
        <WeatherTrendChart v-if="selectedCity.daily?.length" :city-name="selectedCity.name" :daily="selectedCity.daily" />
        <!-- 로딩 실패 시 다시 시도 버튼 표시 -->
        <div v-else-if="dailyState[selectedCity.id] === 'error'" class="chart-placeholder">
          <p>기온 추이를 불러오지 못했어요.</p>
          <button class="retry-btn" type="button" @click="ensureDaily(selectedCity.id)">다시 시도</button>
        </div>
        <p v-else class="chart-placeholder">실시간 데이터를 불러오는 중이에요...</p>
      </section>

      <section id="song" class="section-block">
        <h2 class="block-title">오늘의 추천곡</h2>
        <p class="block-desc">{{ selectedCity.name }}의 날씨 등급에 어울리는 플레이리스트예요.</p>
        <SongPlayerSection :city="selectedCity" :song="songRecommendation" />
        <hr class="divider" />
        <h3 class="sub-title">📸 공유 카드 만들기</h3>
        <ShareCardSection :city="selectedCity" :song="songRecommendation" accent-from="#ff7e5f" accent-to="#7c5cff" />
      </section>

      <section class="section-block">
        <h2 class="block-title">도시별 현황</h2>
        <div class="city-grid">
          <CityWeatherCard
            v-for="city in cityList"
            :key="city.id"
            :city="city"
            :active="city.id === selectedCity.id"
            :is-favorite="favoritesStore.isFavorite(city.id)"
            @select="selectCity"
            @toggle-favorite="favoritesStore.toggle"
          />
        </div>
      </section>

      <section id="favorites" class="section-block">
        <h2 class="block-title">즐겨찾기</h2>
        <FavoriteCities :favorite-cities="favoriteCityObjects" :selected-city-id="selectedCity.id" @select="selectCity" @toggle-favorite="favoritesStore.toggle" />
      </section>
    </main>

    <footer class="app-footer">
      <p>WeatherTune · 날씨 데이터 제공: OpenWeatherMap</p>
    </footer>

    <!-- 🥚 거제를 5번 연속 클릭하면 열리는 이스터에그 -->
    <EasterEggModal v-if="showEasterEgg" :song="EASTER_EGG_SONG" @close="showEasterEgg = false" />
  </div>
</template>

<style scoped>
.weather-music-app {
  min-height: 100vh;
  font-family: inherit;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

/* .theme-dark / .theme-light 변수는 assets/main.css에 전역으로 정의 (CityDetailView.vue와 공유) */
.weather-music-app {
  background: var(--bg);
  color: var(--text);
}

.sections {
  max-width: 880px;
  margin: 0 auto;
  padding: 8px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.load-error {
  font-size: 0.85rem;
  color: #f5576c;
}

.section-block {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
}

.block-title {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
  margin-bottom: 4px;
}

.sub-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 14px;
}

.block-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 18px;
}

.chart-placeholder {
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 30px 0;
  text-align: center;
}

.retry-btn {
  margin-top: 10px;
  border: 1px solid var(--border);
  background: var(--bg-inset);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
}

.retry-btn:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 26px 0;
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.app-footer {
  text-align: center;
  padding: 30px 20px 50px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}
</style>
