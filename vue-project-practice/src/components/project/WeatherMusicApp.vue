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

// 도시 목록/날씨 데이터/지도 좌표 계산은 CityDetailView.vue(도시 상세·공유 페이지)와 함께 쓰는
// composables/useWeatherCities.js로 옮겼다. 두 화면이 각자 fetch하지 않고 같은 캐시를 공유한다.
const { cityList, isLoading, loadError, provincePaths, dailyState, ensureDaily } = useWeatherCities()

// 🥚 거제 이스터에그 전용 히든 트랙. "거제 야호" 밈이 리센느(RESCENE)의 '러브 어택' 역주행을
// 이끌었던 실제 이야기에서 착안했다 (자세한 설명은 EasterEggModal.vue에서).
const EASTER_EGG_SONG = {
  tracks: [
    { title: 'LOVE ATTACK', artist: '리센느 (RESCENE)' },
    { title: 'Pretty Girl', artist: '리센느 (RESCENE)' },
  ],
}

// ── 다크/라이트 테마 (localStorage에 저장해서 다음 방문에도 유지) ──
const THEME_KEY = 'weathertune-theme'
const isDark = ref(true)
const toggleTheme = () => {
  isDark.value = !isDark.value
}
// watch: isDark ref 하나만 감시. 토글 버튼을 눌러 값이 바뀔 때마다 localStorage에 저장(부수효과)
watch(isDark, (value) => localStorage.setItem(THEME_KEY, value ? 'dark' : 'light'))

// ── 즐겨찾기: stores/favoritesStore.js로 옮겼다 (localStorage 저장 로직도 스토어 안에 있음) ──
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

// watch: 트렌드 차트에 보여줄 도시가 바뀔 때마다(=selectedCity.id가 바뀔 때마다) 그 도시의 7일 예보를 불러온다.
// immediate: true라서 첫 화면(기본 선택된 hottestCity)에서도 바로 한 번 호출된다.
// 예전엔 34개 도시 daily를 한꺼번에 fetch해서 느렸고, 실패한 도시는 재시도 방법도 없었다 - 지금은
// "지금 보고 있는 도시"만 불러오고, ensureDaily 안에서 이미 로딩됐으면 중복 호출도 안 한다.
watch(() => selectedCity.value.id, (cityId) => ensureDaily(cityId), { immediate: true })

const favoriteCityObjects = computed(() => cityList.value.filter((c) => favoritesStore.isFavorite(c.id)))

const selectCity = (cityId) => {
  selectedCityId.value = cityId
  trackGeojeCombo(cityId)
}

// ── 🥚 이스터에그: 거제를 5번 연속 클릭하면 히든 트랙 공개 ──
const showEasterEgg = ref(false)
const geojeClickCount = ref(0)
let lastGeojeClickAt = 0

const trackGeojeCombo = (cityId) => {
  const city = cityList.value.find((c) => c.id === cityId)
  if (city?.name !== '거제') {
    geojeClickCount.value = 0 // 다른 도시를 누르면 콤보가 끊긴다
    return
  }

  const now = Date.now()
  // 이전 클릭에서 1.2초 안에 다시 눌러야 "연속 클릭"으로 인정 (그냥 5번 아무 때나 누른 게 아님)
  geojeClickCount.value = now - lastGeojeClickAt > 1200 ? 1 : geojeClickCount.value + 1
  lastGeojeClickAt = now

  if (geojeClickCount.value >= 5) {
    showEasterEgg.value = true
    geojeClickCount.value = 0
  }
}

// ── 지역 검색 ──
// practice/ModelBasic.vue에서 배운 ":value + @input"을 커스텀 컴포넌트의 v-model로 확장한 것.
// searchQuery는 SearchBar.vue와 v-model:query로 연결되어 입력할 때마다 여기 값이 바로 갱신된다.
const searchQuery = ref('')

// computed: searchQuery.value가 바뀔 때만 다시 계산되는 "검색어와 매칭되는 도시 목록"
const searchMatches = computed(() => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return []
  return cityList.value.filter((city) => city.name.includes(keyword))
})

// 드롭다운에는 최대 6개까지만 보여준다 (computed 위에 computed를 쌓는 연쇄 의존성)
const searchSuggestions = computed(() => searchMatches.value.slice(0, 6))

// 지도 위에서 검색어와 매칭되는 핀만 강조하기 위한 id 집합. 검색어가 없으면 null(=강조 없음)
const searchHighlightIds = computed(() => (searchQuery.value.trim() ? new Set(searchMatches.value.map((c) => c.id)) : null))

// watch: composition/WatchersBasic.vue와 같은 형태. searchQuery가 바뀔 때마다(=글자 입력마다) 실행됨
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

// ── 내 위치와 가장 가까운 도시 찾기 (Geolocation API) ──
const locating = ref(false)
const locateStatus = ref('')

// 두 위경도 사이의 실제 거리(km)를 구하는 하버사인 공식
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
    <!--
      이 파일은 cityList, selectedCityId, isDark 같은 로컬 상태를 가진 부모.
      아래 자식 컴포넌트들에는 :속성="값" 형태로 props를 내려주고,
      @이벤트="핸들러" 형태로 자식이 emit한 이벤트를 받아서 실제 상태를 바꾼다 (props down, events up).
      즐겨찾기(favoritesStore)/단위(configStore)는 로컬 상태가 아니라 Pinia 스토어라서,
      CityWeatherCard/FavoriteCities에는 여전히 props로 내려주지만 UnitToggler는 스토어에 직접 붙는다.
    -->
    <AppHeader :is-dark="isDark" :favorite-count="favoriteCityObjects.length" @toggle-theme="toggleTheme" @navigate="scrollToSection" />

    <HeroSection
      :city-count="cityList.length"
      :warning-count="heatAlertCount + coldAlertCount"
      :rainy-count="rainyCount"
      :is-loading="isLoading"
      :locating="locating"
      :locate-status="locateStatus"
      @locate-me="locateMe"
    />

    <!--
      v-model:query="searchQuery" 는 :query="searchQuery" @update:query="searchQuery = $event" 를 줄인 문법.
      practice/ModelBasic.vue, ModelForm.vue에서 배운 v-model을 커스텀 컴포넌트에 적용한 형태다.
    -->
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
        <p class="block-desc">Open-Meteo 7일 예보 기반</p>
        <WeatherTrendChart v-if="selectedCity.daily?.length" :city-name="selectedCity.name" :daily="selectedCity.daily" />
        <!-- dailyState: useWeatherCities.js가 도시별로 따로 들고 있는 로딩 상태. 실패했을 때는
             "불러오는 중"이라고 거짓말하지 않고 다시 시도 버튼을 보여준다. -->
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
      <p>WeatherTune · 날씨 데이터 제공: Open-Meteo</p>
    </footer>

    <!-- 🥚 거제를 5번 연속 클릭하면 열리는 이스터에그. v-if라서 평소엔 DOM에 아예 없다가 조건 충족 시에만 생성됨 -->
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

/* .theme-dark / .theme-light 변수 정의는 assets/main.css로 옮겼다.
   CityDetailView.vue도 같은 클래스를 써야 해서 전역 CSS로 옮긴 것 - 여기서는 그 변수를 값만 갖다 쓴다. */
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
