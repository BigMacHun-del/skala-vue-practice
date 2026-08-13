import { ref, reactive, computed } from 'vue'
import southKoreaSvgRaw from '@/assets/southKoreaHigh.svg?raw'
import { fetchAllCitiesCurrent, fetchCityForecast, getWeatherCodeInfo } from './useWeatherApi'
import { fetchKmaBulletins, deriveActiveAlerts, mapAlertsToCityAlert, REGION_CODES } from './useKmaAlerts'

// WeatherMusicApp.vue와 CityDetailView.vue가 같은 도시 목록/날씨 상태를 공유하는 컴포저블.
// 상태를 모듈 스코프에 둬서 싱글턴처럼 동작한다 (상세 페이지 갔다 와도 재요청 안 함).

// regionCode: useKmaAlerts.js의 REGION_CODES(광역 10개 특보 권역) 중 이 도시가 속한 코드
const rawCities = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', lat: 37.57, lon: 126.98, regionCode: 108 },
  { id: 'city_02', name: '수원', temp: 18, status: '비', lat: 37.26, lon: 127.01, regionCode: 108 },
  { id: 'city_03', name: '인천', temp: 24, status: '흐림', lat: 37.46, lon: 126.7, regionCode: 108 },
  { id: 'city_04', name: '대전', temp: -3, status: '눈', lat: 36.35, lon: 127.38, regionCode: 133 },
  { id: 'city_05', name: '대구', temp: 36, status: '맑음', lat: 35.87, lon: 128.6, regionCode: 143 },
  { id: 'city_06', name: '부산', temp: 33, status: '흐림', lat: 35.18, lon: 129.08, regionCode: 159 },
  { id: 'city_07', name: '울산', temp: -8, status: '강풍', lat: 35.54, lon: 129.32, regionCode: 159 },
  { id: 'city_08', name: '거제', temp: 22, status: '구름', lat: 34.88, lon: 128.62, regionCode: 159 },
  { id: 'city_09', name: '강릉', temp: 30, status: '맑음', lat: 37.75, lon: 128.9, regionCode: 105 },
  { id: 'city_10', name: '제주', temp: 19, status: '비', lat: 33.5, lon: 126.53, regionCode: 184 },
  { id: 'city_11', name: '평창', temp: -14, status: '폭설', lat: 37.37, lon: 128.39, regionCode: 109 },
  { id: 'city_12', name: '포항', temp: 35, status: '맑음', lat: 36.02, lon: 129.37, regionCode: 143 },
  { id: 'city_13', name: '광주', temp: 26, status: '맑음', lat: 35.16, lon: 126.85, regionCode: 156 },
  { id: 'city_14', name: '세종', temp: 15, status: '흐림', lat: 36.48, lon: 127.29, regionCode: 133 },
  { id: 'city_15', name: '춘천', temp: -6, status: '눈', lat: 37.88, lon: 127.73, regionCode: 109 },
  { id: 'city_16', name: '청주', temp: 20, status: '구름', lat: 36.64, lon: 127.49, regionCode: 131 },
  { id: 'city_17', name: '전주', temp: 24, status: '맑음', lat: 35.82, lon: 127.15, regionCode: 146 },
  { id: 'city_18', name: '목포', temp: 17, status: '비', lat: 34.81, lon: 126.39, regionCode: 156 },
  { id: 'city_19', name: '여수', temp: 23, status: '흐림', lat: 34.76, lon: 127.66, regionCode: 156 },
  { id: 'city_20', name: '창원', temp: 31, status: '맑음', lat: 35.23, lon: 128.68, regionCode: 159 },
  { id: 'city_21', name: '진주', temp: 29, status: '구름', lat: 35.18, lon: 128.11, regionCode: 159 },
  { id: 'city_22', name: '안동', temp: 34, status: '맑음', lat: 36.57, lon: 128.73, regionCode: 143 },
  { id: 'city_23', name: '속초', temp: -10, status: '눈', lat: 38.21, lon: 128.59, regionCode: 105 },
  { id: 'city_24', name: '통영', temp: 25, status: '맑음', lat: 34.85, lon: 128.43, regionCode: 159 },
  { id: 'city_25', name: '군산', temp: 16, status: '비', lat: 35.97, lon: 126.74, regionCode: 146 },
  { id: 'city_26', name: '원주', temp: -1, status: '흐림', lat: 37.34, lon: 127.92, regionCode: 109 },
  { id: 'city_27', name: '천안', temp: 12, status: '구름', lat: 36.82, lon: 127.11, regionCode: 133 },
  { id: 'city_28', name: '김해', temp: 32, status: '맑음', lat: 35.23, lon: 128.89, regionCode: 159 },
  { id: 'city_29', name: '구미', temp: 27, status: '맑음', lat: 36.12, lon: 128.34, regionCode: 143 },
  { id: 'city_30', name: '경주', temp: 33, status: '맑음', lat: 35.86, lon: 129.22, regionCode: 143 },
  { id: 'city_31', name: '나주', temp: 21, status: '흐림', lat: 35.02, lon: 126.71, regionCode: 156 },
  { id: 'city_32', name: '충주', temp: 3, status: '구름', lat: 36.99, lon: 127.93, regionCode: 131 },
  { id: 'city_33', name: '파주', temp: -13, status: '폭설', lat: 37.76, lon: 126.78, regionCode: 108 },
  { id: 'city_34', name: '여주', temp: 8, status: '맑음', lat: 37.30, lon: 127.64, regionCode: 108 },
]

// 실시간 데이터 도착 전 표시할 기본 아이콘
const STATUS_ICON_FALLBACK = { 맑음: '☀️', 비: '🌧️', 흐림: '☁️', 구름: '⛅', 눈: '❄️', 강풍: '🌬️', 폭설: '❄️' }

// southKoreaHigh.svg의 <path id="KR-xx" data-name="..." /> 태그를 파싱
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

// 위경도 → 지도 좌표(%) 변환 (메르카토르 투영, southKoreaHigh.svg 기준 보정)
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

// 특보가 없을 때 보여줄 평상시 기온 문구 (경보/주의보는 실제 기상청 특보로 대체, useKmaAlerts.js 참고)
const getAmbientBand = (temp) => {
  if (temp >= 28) return { label: '무더움', class: 'hot' }
  if (temp <= 5) return { label: '쌀쌀함', class: 'cold' }
  return { label: '선선함', class: 'cool' }
}

// 오늘 예상 강수량(mm) 기준 호우 특보 등급 (기상청 기준 단순화)
const getRainAlert = (precipitationSum) => {
  if (precipitationSum == null) return null
  if (precipitationSum >= 80) return { label: '호우경보', class: 'rain-warning' }
  if (precipitationSum >= 30) return { label: '호우주의보', class: 'rain-caution' }
  return null
}

// 등급별 추천곡
export const SONG_GUIDE = {
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
  // 폭염·한파·호우 외 나머지 특보 (대설/강풍/태풍 등)
  'other-warning': { emoji: '🚨', mood: '기상 경보가 발효 중이에요, 외출은 잠시 미뤄두는 게 어때요', tracks: [
    { title: 'Rain', artist: '태연' },
    { title: '우산', artist: '윤하' },
  ] },
  'other-caution': { emoji: '⚠️', mood: '기상 주의보가 떠 있어요, 실내에서 듣기 좋은 곡이에요', tracks: [
    { title: '흠뻑', artist: '헤이즈' },
    { title: '오늘, 너로 인해', artist: '어반자카파' },
  ] },
}

export const legendItems = [
  { class: 'heat-warning', label: '폭염경보' },
  { class: 'heat-caution', label: '폭염주의보' },
  { class: 'hot', label: '무더움' },
  { class: 'cool', label: '선선함' },
  { class: 'cold', label: '쌀쌀함' },
  { class: 'cold-caution', label: '한파주의보' },
  { class: 'cold-warning', label: '한파경보' },
  { class: 'other-caution', label: '기타 주의보' },
  { class: 'other-warning', label: '기타 경보' },
]

// 모듈 스코프 반응형 상태 (싱글턴). HMR로 모듈이 재실행돼도 import.meta.hot.data에 담아두면
// 상태(불러온 날씨 등)가 유지되어 저장할 때마다 API를 다시 부르지 않는다.
const createInitialStore = () => ({
  cities: ref(
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
  ),
  isLoading: ref(true),
  loadError: ref(''),
  dailyState: reactive({}),
  hasRequested: false,
  // regionCode -> deriveActiveAlerts() 결과 배열 캐시
  regionAlerts: reactive({}),
  hasRequestedAlerts: false,
})

const hot = import.meta.hot
const store = hot ? (hot.data.weatherStore ??= createInitialStore()) : createInitialStore()

// dailyState: 도시별 7일 예보 로딩 상태 (id → 'idle' | 'loading' | 'loaded' | 'error')
const { cities, isLoading, loadError, dailyState, regionAlerts } = store

const loadLiveWeather = async () => {
  isLoading.value = true
  try {
    const results = await fetchAllCitiesCurrent(rawCities.map((c) => ({ id: c.id, lat: c.lat, lon: c.lon })))
    cities.value = cities.value.map((city) => {
      const result = results.get(city.id)
      if (!result?.ok) return city
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

// 선택된 도시 하나의 7일 예보만 불러온다 (로딩/완료 상태면 중복 요청 안 함)
const ensureDaily = async (cityId) => {
  if (dailyState[cityId] === 'loading' || dailyState[cityId] === 'loaded') return
  const city = cities.value.find((c) => c.id === cityId)
  if (!city) return

  dailyState[cityId] = 'loading'
  try {
    const result = await fetchCityForecast(city.lat, city.lon)
    cities.value = cities.value.map((c) => (c.id === cityId ? { ...c, daily: result.daily, isLive: true } : c))
    dailyState[cityId] = 'loaded'
  } catch (err) {
    console.error(err)
    dailyState[cityId] = 'error'
  }
}

// 10개 권역 특보를 각각 불러와 regionAlerts에 캐시 (일부 권역 실패해도 나머지는 정상 반영)
const loadRegionAlerts = async () => {
  const codes = Object.keys(REGION_CODES)
  const results = await Promise.allSettled(
    codes.map((code) => fetchKmaBulletins(30, code).then((items) => [code, deriveActiveAlerts(items)])),
  )
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const [code, activeAlerts] = result.value
      regionAlerts[code] = activeAlerts
    } else {
      console.error(result.reason)
    }
  }
}

// 도시가 속한 권역에 실제 특보가 있으면 그걸, 없으면 평상시 기온 문구로 대체
const getCityAlert = (city) => {
  const active = regionAlerts[city.regionCode] ?? []
  return mapAlertsToCityAlert(active) ?? getAmbientBand(city.temp)
}

const cityList = computed(() =>
  cities.value.map((city) => ({
    ...city,
    ...toMapPosition(city.lat, city.lon),
    alert: getCityAlert(city),
    rainAlert: getRainAlert(city.daily?.[0]?.precipitationSum ?? null),
  })),
)

// WeatherMusicApp.vue / CityDetailView.vue 공용 진입점
export function useWeatherCities() {
  if (!store.hasRequested) {
    store.hasRequested = true
    loadLiveWeather()
  }
  if (!store.hasRequestedAlerts) {
    store.hasRequestedAlerts = true
    loadRegionAlerts()
  }
  return { cityList, isLoading, loadError, provincePaths, dailyState, ensureDaily, refetch: loadLiveWeather }
}
