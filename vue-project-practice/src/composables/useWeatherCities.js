import { ref, reactive, computed } from 'vue'
import southKoreaSvgRaw from '@/assets/southKoreaHigh.svg?raw'
import { fetchAllCitiesCurrent, fetchCityForecast, getWeatherCodeInfo } from './useWeatherApi'
import { fetchKmaBulletins, deriveActiveAlerts, mapAlertsToCityAlert, REGION_CODES } from './useKmaAlerts'

/**
 * WeatherMusicApp.vue(메인 화면)와 CityDetailView.vue(도시 상세/공유 페이지)가
 * "같은 도시 목록/날씨 상태"를 함께 봐야 해서 만든 공용 컴포저블.
 * 아래 반응형 상태(cities, isLoading 등)는 이 함수 "안"이 아니라 파일 최상단(모듈 스코프)에 만든다.
 * → useWeatherCities()를 여러 컴포넌트에서 각각 호출해도 매번 새로 만들어지지 않고 같은 ref를 공유하는
 *   "싱글턴 스토어" 형태가 되어, 상세 페이지에 갔다 돌아와도 날씨를 다시 불러오지 않는다.
 */

// ── 도시 원본 데이터 (실시간 데이터가 오기 전 보여줄 기본값 포함) ──
// regionCode: useKmaAlerts.js의 REGION_CODES(광역 10개 특보 권역) 중 이 도시가 속한 코드.
// 실제 행정구역 기준으로 매핑했다 (예: 거제/창원/진주/통영/김해는 경남이라 159, 포항/안동/구미/경주는
// 경북이라 143). 이 코드로 도시별이 아니라 "그 도시가 속한 권역" 단위 특보를 붙인다.
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

// 실시간 데이터가 도착하기 전 표시할 기본 아이콘 (mock 날씨 문구 기준)
const STATUS_ICON_FALLBACK = { 맑음: '☀️', 비: '🌧️', 흐림: '☁️', 구름: '⛅', 눈: '❄️', 강풍: '🌬️', 폭설: '❄️' }

// southKoreaHigh.svg의 <path d="..." id="KR-xx" data-name="시/도 이름" /> 태그들을 파싱
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
// 예전엔 이 함수 하나가 "폭염경보/폭염주의보/한파경보/한파주의보"까지 전부 기온 임계값만 보고
// 하드코딩으로 판정했다. 이제 그 경보/주의보 등급은 기상청 실제 특보(useKmaAlerts.js, getCityAlert
// 참고)로 대체하고, 이 함수는 "특보가 안 떠 있을 때"만 쓰는 평상시 기온 문구(무더움/쌀쌀함/선선함)로
// 역할을 줄였다 - 그래서 -warning/-caution 등급은 더 이상 여기서 안 나온다.
const getAmbientBand = (temp) => {
  if (temp >= 28) return { label: '무더움', class: 'hot' }
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
  // 대설/강풍/태풍/안개/건조/황사 등 폭염·한파·호우 외 나머지 특보 - 실제 기상청 특보 연동(useKmaAlerts.js)
  // 전엔 나올 일이 없던 등급이라 SONG_GUIDE에 없었는데, 이제 실제로 뜰 수 있어서 추가했다.
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
  // 대설/강풍/태풍 등 폭염·한파·호우로 안 묶이는 나머지 특보 종류 (useKmaAlerts.js의 hazardToClass 참고)
  { class: 'other-caution', label: '기타 주의보' },
  { class: 'other-warning', label: '기타 경보' },
]

// ── 모듈 스코프 반응형 상태 (싱글턴) ──
// Vite HMR 안전장치: 개발 서버에서 이 파일(또는 useWeatherApi.js)을 저장하면 모듈이 다시 실행되면서
// cities/hasRequested 같은 상태가 매번 새로 만들어진다. 그러면 저장할 때마다 34개 도시 날씨를
// 처음부터 다시 요청하게 되고, 짧은 시간에 반복되면 Open-Meteo 요청 제한(429)에 걸린다.
// import.meta.hot.data는 HMR로 모듈이 재실행돼도 Vite가 그대로 들고 있어주는 저장 공간이라,
// 여기 담아두면 코드만 바뀌고 상태(이미 불러온 날씨, hasRequested 여부)는 그대로 유지된다.
// (프로덕션 빌드에는 import.meta.hot이 없어서 매번 새로 만드는 게 맞고, 그게 정상 동작이다)
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
  hasRequested: false, // StrictMode/두 컴포넌트 동시 마운트 등으로 fetch가 중복 실행되는 걸 막는 플래그
  // regionCode(REGION_CODES의 키) -> deriveActiveAlerts() 결과 배열. 10개 권역 각각 한 번씩만 불러서
  // 여기 캐시해두고, cityList computed에서 도시의 regionCode로 이 캐시를 찾아 배지를 만든다.
  regionAlerts: reactive({}),
  hasRequestedAlerts: false, // loadRegionAlerts 중복 실행 방지 플래그 (hasRequested와 같은 이유)
})

const hot = import.meta.hot
const store = hot ? (hot.data.weatherStore ??= createInitialStore()) : createInitialStore()

// dailyState: 도시별 "7일 예보(daily)" 로딩 상태 (id → 'idle' | 'loading' | 'loaded' | 'error')
// 예전에는 34개 도시 전부의 daily를 한 번에 fetch했는데, 그러면 요청이 무겁고 느려지는 데다
// 그중 한 도시라도 실패하면 그 도시는 재시도할 방법 없이 영원히 "불러오는 중"으로 멈춰있었다.
// 이제는 지금 화면에 보여줄 딱 한 도시(선택된 도시)의 daily만 그때그때 따로 불러온다.
const { cities, isLoading, loadError, dailyState, regionAlerts } = store

const loadLiveWeather = async () => {
  isLoading.value = true
  try {
    // "지금 날씨"만 가볍게 34개 도시 동시 조회 (daily 없음 → 응답이 가볍고 빠름)
    const results = await fetchAllCitiesCurrent(rawCities.map((c) => ({ id: c.id, lat: c.lat, lon: c.lon })))
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

/**
 * 특정 도시 하나의 7일 예보(daily)만 따로 불러온다. 트렌드 차트를 보여줘야 하는 "선택된 도시"가
 * 바뀔 때마다 WeatherMusicApp.vue / CityDetailView.vue에서 이 함수를 호출한다.
 * 이미 불러왔거나(loaded) 지금 불러오는 중(loading)이면 중복 요청하지 않고, 실패했을 때만(error)
 * 다시 호출하면 재시도가 된다 - 그래서 "다시 시도" 버튼에도 그대로 이 함수를 연결하면 된다.
 */
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

/**
 * REGION_CODES에 있는 10개 권역 전부에 대해 한 번씩 특보를 불러와 regionAlerts에 캐시한다.
 * Promise.allSettled로 돌려서 특정 권역 하나가 실패해도(네트워크 오류 등) 나머지 9개는 정상 반영되고,
 * 실패한 권역은 그냥 regionAlerts에 안 채워진 채로 남아 getCityAlert()가 평상시 문구로 대체한다.
 */
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

// 도시가 속한 권역(regionCode)에 실제 발효 중인 특보가 있으면 그걸로, 없으면(또는 아직 못 불러왔으면)
// 기존 기온 기반 평상시 문구(무더움/선선함/쌀쌀함)로 대체 - 카드/지도/플레이리스트가 항상 alert가
// null이 아니라고 가정하고 있어서, 이 "실제 데이터 없으면 폴백" 구조로 기존 코드를 안 건드리게 했다.
const getCityAlert = (city) => {
  const active = regionAlerts[city.regionCode] ?? []
  return mapAlertsToCityAlert(active) ?? getAmbientBand(city.temp)
}

// cities에 지도 좌표 + 기온/강수 등급을 계산해서 붙인 computed 목록
const cityList = computed(() =>
  cities.value.map((city) => ({
    ...city,
    ...toMapPosition(city.lat, city.lon),
    alert: getCityAlert(city),
    rainAlert: getRainAlert(city.daily?.[0]?.precipitationSum ?? null),
  })),
)

/**
 * WeatherMusicApp.vue / CityDetailView.vue에서 공통으로 쓰는 진입점.
 * 처음 호출될 때만 실시간 날씨를 fetch하고, 그 다음부터는 캐시된 cityList를 그대로 재사용한다.
 */
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
