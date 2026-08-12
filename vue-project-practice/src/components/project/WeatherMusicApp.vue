<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import southKoreaSvgRaw from '@/assets/southKoreaHigh.svg?raw'
import { fetchAllCitiesForecast, getWeatherCodeInfo } from '@/composables/useWeatherApi'

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

// ── 도시 원본 데이터 (실시간 데이터가 오기 전 보여줄 기본값 포함) ──
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
  { id: 'city_13', name: '광주', temp: 26, status: '맑음', lat: 35.16, lon: 126.85 },
  { id: 'city_14', name: '세종', temp: 15, status: '흐림', lat: 36.48, lon: 127.29 },
  { id: 'city_15', name: '춘천', temp: -6, status: '눈', lat: 37.88, lon: 127.73 },
  { id: 'city_16', name: '청주', temp: 20, status: '구름', lat: 36.64, lon: 127.49 },
  { id: 'city_17', name: '전주', temp: 24, status: '맑음', lat: 35.82, lon: 127.15 },
  { id: 'city_18', name: '목포', temp: 17, status: '비', lat: 34.81, lon: 126.39 },
  { id: 'city_19', name: '여수', temp: 23, status: '흐림', lat: 34.76, lon: 127.66 },
  { id: 'city_20', name: '창원', temp: 31, status: '맑음', lat: 35.23, lon: 128.68 },
  { id: 'city_21', name: '진주', temp: 29, status: '구름', lat: 35.18, lon: 128.11 },
  { id: 'city_22', name: '안동', temp: 34, status: '맑음', lat: 36.57, lon: 128.73 },
  { id: 'city_23', name: '속초', temp: -10, status: '눈', lat: 38.21, lon: 128.59 },
  { id: 'city_24', name: '통영', temp: 25, status: '맑음', lat: 34.85, lon: 128.43 },
  { id: 'city_25', name: '군산', temp: 16, status: '비', lat: 35.97, lon: 126.74 },
  { id: 'city_26', name: '원주', temp: -1, status: '흐림', lat: 37.34, lon: 127.92 },
  { id: 'city_27', name: '천안', temp: 12, status: '구름', lat: 36.82, lon: 127.11 },
  { id: 'city_28', name: '김해', temp: 32, status: '맑음', lat: 35.23, lon: 128.89 },
  { id: 'city_29', name: '구미', temp: 27, status: '맑음', lat: 36.12, lon: 128.34 },
  { id: 'city_30', name: '경주', temp: 33, status: '맑음', lat: 35.86, lon: 129.22 },
  { id: 'city_31', name: '나주', temp: 21, status: '흐림', lat: 35.02, lon: 126.71 },
  { id: 'city_32', name: '충주', temp: 3, status: '구름', lat: 36.99, lon: 127.93 },
  { id: 'city_33', name: '파주', temp: -13, status: '폭설', lat: 37.76, lon: 126.78 },
  { id: 'city_34', name: '여주', temp: 8, status: '맑음', lat: 37.30, lon: 127.64 },
]

// 실시간 데이터가 도착하기 전 표시할 기본 아이콘 (mock 날씨 문구 기준)
const STATUS_ICON_FALLBACK = { 맑음: '☀️', 비: '🌧️', 흐림: '☁️', 구름: '⛅', 눈: '❄️', 강풍: '🌬️', 폭설: '❄️' }

/**
 * southKoreaHigh.svg의 <path d="..." id="KR-xx" data-name="시/도 이름" /> 태그들을 파싱
 */
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

// ── 위경도 → 지도 좌표(%) 변환 (메르카토르 투영, southKoreaHigh.svg 기준으로 보정) ──
const SVG_VIEW_BOX = { x: 79.59, y: -2, width: 800.82, height: 964 }
const MERCATOR_FIT = { a: 139.99066283955688, b: -17465.10548928772, c: -8282.041815281516, d: 6057.964242923005 }

const toMapPosition = (lat, lon) => {
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2))
  const svgX = MERCATOR_FIT.a * lon + MERCATOR_FIT.b
  const svgY = MERCATOR_FIT.c * mercatorY + MERCATOR_FIT.d
  return {
    x: ((svgX - SVG_VIEW_BOX.x) / SVG_VIEW_BOX.width) * 100,
    y: ((svgY - SVG_VIEW_BOX.y) / SVG_VIEW_BOX.height) * 100,
  }
}

// ── 기온/강수량 등급 판정 ──
const getWeatherAlert = (temp) => {
  if (temp >= 35) return { label: '폭염경보', class: 'heat-warning' }
  if (temp >= 33) return { label: '폭염주의보', class: 'heat-caution' }
  if (temp >= 28) return { label: '무더움', class: 'hot' }
  if (temp <= -12) return { label: '한파경보', class: 'cold-warning' }
  if (temp <= -5) return { label: '한파주의보', class: 'cold-caution' }
  if (temp <= 5) return { label: '쌀쌀함', class: 'cold' }
  return { label: '선선함', class: 'cool' }
}

// 오늘 하루 예상 강수량(mm) 기준의 호우 특보 등급 (기상청 기준을 단순화)
const getRainAlert = (precipitationSum) => {
  if (precipitationSum == null) return null
  if (precipitationSum >= 80) return { label: '호우경보', class: 'rain-warning' }
  if (precipitationSum >= 30) return { label: '호우주의보', class: 'rain-caution' }
  return null
}

// 등급별 추천곡
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

// 🥚 거제 이스터에그 전용 히든 트랙. "거제 야호" 밈이 리센느(RESCENE)의 '러브 어택' 역주행을
// 이끌었던 실제 이야기에서 착안했다 (자세한 설명은 EasterEggModal.vue에서).
const EASTER_EGG_SONG = {
  tracks: [
    { title: 'LOVE ATTACK', artist: '리센느 (RESCENE)' },
    { title: 'Pretty Girl', artist: '리센느 (RESCENE)' },
  ],
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

// ── 다크/라이트 테마 (localStorage에 저장해서 다음 방문에도 유지) ──
const THEME_KEY = 'weathertune-theme'
const isDark = ref(true)
const toggleTheme = () => {
  isDark.value = !isDark.value
}
// watch: isDark ref 하나만 감시. 토글 버튼을 눌러 값이 바뀔 때마다 localStorage에 저장(부수효과)
watch(isDark, (value) => localStorage.setItem(THEME_KEY, value ? 'dark' : 'light'))

// ── 즐겨찾기 (localStorage 저장, Set은 reactive()로 감싸야 add/delete가 반응형으로 감지됨) ──
const FAVORITES_KEY = 'weathertune-favorites'
const favoriteIds = reactive(new Set())
const toggleFavorite = (cityId) => {
  if (favoriteIds.has(cityId)) favoriteIds.delete(cityId)
  else favoriteIds.add(cityId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteIds]))
}

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) isDark.value = savedTheme === 'dark'

  const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
  savedFavorites.forEach((id) => favoriteIds.add(id))
})

// ── 도시별 실시간 날씨 상태 ──
const cities = ref(
  rawCities.map((city) => ({
    ...city,
    weatherLabel: city.status,
    weatherIcon: STATUS_ICON_FALLBACK[city.status] ?? '⛅',
    precipitation: null,
    windSpeed: null,
    weatherCode: null,
    isRain: city.status === '비',
    isSnow: city.status === '눈' || city.status === '폭설',
    daily: [],
    isLive: false,
  })),
)
const isLoading = ref(true)
const loadError = ref('')

const loadLiveWeather = async () => {
  isLoading.value = true
  try {
    const results = await fetchAllCitiesForecast(rawCities.map((c) => ({ id: c.id, lat: c.lat, lon: c.lon })))
    cities.value = cities.value.map((city) => {
      const result = results.get(city.id)
      if (!result?.ok) return city // 실패한 도시는 기존 mock 값을 그대로 유지
      const info = getWeatherCodeInfo(result.data.weatherCode)
      return {
        ...city,
        temp: result.data.temp,
        precipitation: result.data.precipitation,
        windSpeed: result.data.windSpeed,
        weatherCode: result.data.weatherCode,
        weatherLabel: info.label,
        weatherIcon: info.icon,
        isRain: info.isRain,
        isSnow: info.isSnow,
        daily: result.data.daily,
        isLive: true,
      }
    })
  } catch (err) {
    loadError.value = '실시간 날씨를 불러오지 못해 기본값으로 표시하고 있어요.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLiveWeather)

// cities에 지도 좌표 + 기온/강수 등급을 계산해서 붙인 computed 목록
const cityList = computed(() =>
  cities.value.map((city) => ({
    ...city,
    ...toMapPosition(city.lat, city.lon),
    alert: getWeatherAlert(city.temp),
    rainAlert: getRainAlert(city.daily?.[0]?.precipitationSum ?? null),
  })),
)

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

const favoriteCityObjects = computed(() => cityList.value.filter((c) => favoriteIds.has(c.id)))

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
      이 파일은 모든 상태(cities, selectedCityId, isDark, favoriteIds...)를 가진 부모.
      아래 자식 컴포넌트들에는 :속성="값" 형태로 props를 내려주고,
      @이벤트="핸들러" 형태로 자식이 emit한 이벤트를 받아서 실제 상태를 바꾼다 (props down, events up).
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
            :is-favorite="favoriteIds.has(city.id)"
            @select="selectCity"
            @toggle-favorite="toggleFavorite"
          />
        </div>
      </section>

      <section id="favorites" class="section-block">
        <h2 class="block-title">즐겨찾기</h2>
        <FavoriteCities :favorite-cities="favoriteCityObjects" :selected-city-id="selectedCity.id" @select="selectCity" @toggle-favorite="toggleFavorite" />
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

/* ── 다크 테마: 밤하늘 위성사진 느낌 ── */
.weather-music-app.theme-dark {
  --bg: #0b0c14;
  --bg-elevated: #14151f;
  --bg-inset: #05060a;
  --border: #262838;
  --text: #f2f1f7;
  --text-secondary: #9a98ad;
  --accent-1: #ff7e5f;
  --accent-2: #7c5cff;
  --map-bg: radial-gradient(circle at 28% 18%, #0c1f18 0%, #060d10 45%, #010409 100%);
  --map-land-1: #14301f;
  --map-land-2: #2f5c38;
  --map-land-3: #1c3722;
  --map-border: rgba(88, 166, 255, 0.2);
}

/* ── 라이트 테마: 맑은 낮하늘 느낌 ── */
.weather-music-app.theme-light {
  --bg: #faf7f2;
  --bg-elevated: #ffffff;
  --bg-inset: #f1ede4;
  --border: #e6e1d3;
  --text: #201f2b;
  --text-secondary: #6b6875;
  --accent-1: #ff7e5f;
  --accent-2: #7c5cff;
  --map-bg: linear-gradient(160deg, #cdeaff 0%, #e8f5ff 60%, #f7fcff 100%);
  --map-land-1: #bfead0;
  --map-land-2: #8fd19e;
  --map-land-3: #6fb583;
  --map-border: rgba(59, 130, 246, 0.35);
}

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
